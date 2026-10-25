import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import prisma from '../../config/database';
import { config } from '../../config';

const router = Router();
router.use(authenticate);

const consentSchema = z.object({
  consents: z.array(z.object({
    consentType: z.enum(['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'AI_PROCESSING', 'PHOTO_ANALYSIS', 'DATA_RETENTION', 'MARKETING']),
    granted: z.boolean(),
    version: z.string().min(1),
  })),
});

// GET /api/v1/privacy/consents
router.get('/consents', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consents = await prisma.userConsent.findMany({ where: { userId: req.currentUserId! } });
    res.json({ success: true, data: consents });
  } catch (err) { next(err); }
});

// PATCH /api/v1/privacy/consents
router.patch('/consents', validate(consentSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.currentUserId!;
    const results = await Promise.all(
      req.body.consents.map(async (c: { consentType: string; granted: boolean; version: string }) => {
        return prisma.userConsent.upsert({
          where: {
            userId_consentType_version: {
              userId,
              consentType: c.consentType as 'TERMS_OF_SERVICE',
              version: c.version,
            },
          },
          create: {
            userId,
            consentType: c.consentType as 'TERMS_OF_SERVICE',
            version: c.version,
            grantedAt: c.granted ? new Date() : null,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          },
          update: {
            grantedAt: c.granted ? new Date() : null,
            withdrawnAt: !c.granted ? new Date() : null,
          },
        });
      })
    );
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

// DELETE /api/v1/privacy/account — permanent account deletion
router.delete('/account', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.currentUserId!;

    // Get all file paths before deleting DB records
    const wardrobeItems = await prisma.wardrobeItem.findMany({
      where: { userId },
      select: { imagePath: true, thumbnailPath: true },
    });
    const tryOnJobs = await prisma.tryOnJob.findMany({
      where: { userId },
      select: { referenceImagePath: true, resultImagePath: true },
    });

    // Delete user (cascade handles DB records)
    await prisma.user.delete({ where: { id: userId } });

    // Delete physical files after DB cleanup
    const filesToDelete = [
      ...wardrobeItems.flatMap((i) => [i.imagePath, i.thumbnailPath].filter(Boolean)),
      ...tryOnJobs.flatMap((j) => [j.referenceImagePath, j.resultImagePath].filter(Boolean)),
    ] as string[];

    for (const filePath of filesToDelete) {
      try {
        const fullPath = path.isAbsolute(filePath) ? filePath : path.resolve(config.storage.uploadDir, filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      } catch { /* Best effort file cleanup */ }
    }

    res.json({ success: true, data: { message: 'Account and all associated data have been deleted.' } });
  } catch (err) { next(err); }
});

// GET /api/v1/privacy/photos — list user photos (for deletion requests)
router.get('/photos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [wardrobe, tryOns] = await Promise.all([
      prisma.wardrobeItem.findMany({ where: { userId: req.currentUserId! }, select: { id: true, name: true, imagePath: true, createdAt: true } }),
      prisma.tryOnJob.findMany({ where: { userId: req.currentUserId! }, select: { id: true, referenceImagePath: true, resultImagePath: true, createdAt: true } }),
    ]);
    res.json({ success: true, data: { wardrobePhotos: wardrobe, tryOnPhotos: tryOns } });
  } catch (err) { next(err); }
});

// POST /api/v1/privacy/export — data export
router.post('/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.currentUserId!;
    const [user, profile, preferences, wardrobeItems, outfits, plans, looks, consents] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.stylePreference.findMany({ where: { userId } }),
      prisma.wardrobeItem.findMany({ where: { userId }, include: { tags: true } }),
      prisma.outfit.findMany({ where: { userId } }),
      prisma.outfitPlan.findMany({ where: { userId } }),
      prisma.savedLook.findMany({ where: { userId } }),
      prisma.userConsent.findMany({ where: { userId } }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      note: 'This is your personal data export from OOTD-Nan. File paths reference server-side storage.',
      user,
      profile,
      stylePreferences: preferences,
      wardrobeItems: wardrobeItems.map((i) => ({ ...i, imagePath: '[STORED_ON_SERVER]', thumbnailPath: '[STORED_ON_SERVER]' })),
      outfits,
      outfitPlans: plans,
      savedLooks: looks,
      consents,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="ootd-nan-export-${Date.now()}.json"`);
    res.json(exportData);
  } catch (err) { next(err); }
});

export default router;
