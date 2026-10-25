import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import prisma from '../../config/database';
import { createError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate);

const outfitPlanSchema = z.object({
  outfitId: z.string().uuid(),
  plannedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  occasion: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

// GET /api/v1/planner
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year } = req.query;
    const where: Record<string, unknown> = { userId: req.currentUserId! };

    if (month && year) {
      const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      where.plannedDate = { gte: startDate, lt: endDate };
    }

    const plans = await prisma.outfitPlan.findMany({
      where,
      include: { outfit: { include: { items: { include: { wardrobeItem: true } } } } },
      orderBy: { plannedDate: 'asc' },
    });
    res.json({ success: true, data: plans });
  } catch (err) { next(err); }
});

// POST /api/v1/planner
router.post('/', validate(outfitPlanSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verify outfit ownership
    const outfit = await prisma.outfit.findFirst({ where: { id: req.body.outfitId, userId: req.currentUserId! } });
    if (!outfit) throw createError('Outfit not found', 404, 'OUTFIT_NOT_FOUND');

    const plan = await prisma.outfitPlan.create({
      data: {
        userId: req.currentUserId!,
        outfitId: req.body.outfitId,
        plannedDate: new Date(req.body.plannedDate),
        occasion: req.body.occasion,
        notes: req.body.notes,
      },
      include: { outfit: true },
    });
    res.status(201).json({ success: true, data: plan });
  } catch (err) { next(err); }
});

// PATCH /api/v1/planner/:id
router.patch('/:id', validate(outfitPlanSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await prisma.outfitPlan.findFirst({ where: { id: req.params.id, userId: req.currentUserId! } });
    if (!plan) throw createError('Outfit plan not found', 404, 'NOT_FOUND');

    const updated = await prisma.outfitPlan.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        ...(req.body.plannedDate ? { plannedDate: new Date(req.body.plannedDate) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// DELETE /api/v1/planner/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await prisma.outfitPlan.findFirst({ where: { id: req.params.id, userId: req.currentUserId! } });
    if (!plan) throw createError('Outfit plan not found', 404, 'NOT_FOUND');
    await prisma.outfitPlan.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Plan deleted' } });
  } catch (err) { next(err); }
});

export default router;
