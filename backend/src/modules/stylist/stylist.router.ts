import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import prisma from '../../config/database';
import { Prisma } from '@prisma/client';
import { generateOutfitRecommendations, getAiStatus } from '../../services/ai/nemotron.service';
import { createError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate);

const stylistRequestSchema = z.object({
  occasion: z.string().min(1).max(100),
  formality: z.string().max(50).optional(),
  weatherPreference: z.string().max(100).optional(),
  stylePreferences: z.array(z.string()).optional(),
  colorPreferences: z.array(z.string()).optional(),
  avoidColors: z.array(z.string()).optional(),
  comfortPriority: z.number().int().min(1).max(5).optional(),
  selectedItemIds: z.array(z.string().uuid()).optional(),
});

// GET /api/v1/stylist/status
router.get('/status', (_req: Request, res: Response) => {
  res.json({ success: true, data: getAiStatus() });
});

// POST /api/v1/stylist/recommendations
router.post('/recommendations', validate(stylistRequestSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.currentUserId!;
    const input = req.body;

    // Check AI configuration first
    const aiStatus = getAiStatus();
    if (!aiStatus.configured) {
      res.status(503).json({
        success: false,
        error: {
          code: 'AI_NOT_CONFIGURED',
          message: 'AI styling is not configured. Please add your NEBIUS_API_KEY to enable recommendations.',
          data: { configured: false, setupRequired: true },
        },
      });
      return;
    }

    // Get user's wardrobe
    const wardrobeQuery = input.selectedItemIds?.length
      ? { userId, id: { in: input.selectedItemIds }, isArchived: false }
      : { userId, isArchived: false };

    const wardrobeItems = await prisma.wardrobeItem.findMany({
      where: wardrobeQuery,
      include: { tags: true },
      take: 50, // Limit context size
    });

    if (wardrobeItems.length < 2) {
      throw createError(
        'You need at least 2 wardrobe items to get outfit recommendations. Please add more clothes to your wardrobe.',
        400,
        'INSUFFICIENT_WARDROBE'
      );
    }

    // Create styling request record
    const stylingRequest = await prisma.stylingRequest.create({
      data: {
        userId,
        occasion: input.occasion,
        formality: input.formality,
        weatherPreference: input.weatherPreference,
        stylePreferences: input.stylePreferences,
        colorPreferences: input.colorPreferences,
        avoidColors: input.avoidColors,
        comfortPriority: input.comfortPriority,
        selectedItemIds: input.selectedItemIds,
        status: 'PROCESSING',
      },
    });

    // Build context for AI
    const validItemIds = new Set(wardrobeItems.map((i) => i.id));
    const context = {
      items: wardrobeItems.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        dominantColor: item.dominantColor,
        pattern: item.pattern,
        brand: item.brand,
        size: item.size,
        fit: item.fit,
        season: item.season,
        tags: item.tags.map((t) => t.tag),
      })),
      userPreferences: {
        occasion: input.occasion,
        formality: input.formality,
        weatherPreference: input.weatherPreference,
        stylePreferences: input.stylePreferences,
        colorPreferences: input.colorPreferences,
        avoidColors: input.avoidColors,
        comfortPriority: input.comfortPriority,
      },
    };

    try {
      const aiResult = await generateOutfitRecommendations(context, validItemIds);

      // Save outfits to database
      const savedOutfits = await Promise.all(
        aiResult.recommendations.map((rec) =>
          prisma.outfit.create({
            data: {
              userId,
              stylingRequestId: stylingRequest.id,
              name: rec.name,
              occasion: rec.occasion,
              colorPalette: rec.colorPalette,
              recommendationData: rec as unknown as Prisma.InputJsonValue,
              stylingTips: rec.stylingTips,
              status: 'DRAFT',
              items: {
                create: rec.wardrobeItemIds.map((wid, idx) => ({
                  wardrobeItemId: wid,
                  slot: 'auto',
                  position: idx,
                })),
              },
            },
            include: { items: { include: { wardrobeItem: { include: { tags: true } } } } },
          })
        )
      );

      await prisma.stylingRequest.update({
        where: { id: stylingRequest.id },
        data: { status: 'COMPLETED' },
      });

      res.json({
        success: true,
        data: {
          requestId: stylingRequest.id,
          recommendations: aiResult.recommendations,
          outfits: savedOutfits,
        },
      });
    } catch (aiError) {
      await prisma.stylingRequest.update({
        where: { id: stylingRequest.id },
        data: { status: 'FAILED' },
      });
      throw aiError;
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/stylist/requests/:id
router.get('/requests/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await prisma.stylingRequest.findFirst({
      where: { id: req.params.id, userId: req.currentUserId! },
    });
    if (!request) throw createError('Styling request not found', 404, 'NOT_FOUND');
    res.json({ success: true, data: request });
  } catch (err) { next(err); }
});

// GET /api/v1/stylist/requests/:id/results
router.get('/requests/:id/results', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outfits = await prisma.outfit.findMany({
      where: { stylingRequestId: req.params.id, userId: req.currentUserId! },
      include: { items: { include: { wardrobeItem: true } } },
    });
    res.json({ success: true, data: outfits });
  } catch (err) { next(err); }
});

export default router;
