import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import prisma from '../../config/database';
import { Prisma } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';
import { getVtonStatus, processTryOn } from '../../services/ai/virtual-tryon.service';
import { referenceUpload, handleUploadError } from '../../middleware/upload';

const router = Router();
router.use(authenticate);

// GET /api/v1/try-on/status
router.get('/status', (_req: Request, res: Response) => {
  res.json({ success: true, data: getVtonStatus() });
});

// POST /api/v1/try-on — create a try-on job
router.post(
  '/',
  referenceUpload.single('referenceImage'),
  handleUploadError,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.currentUserId!;

      if (!req.file) {
        res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Reference photo is required' } });
        return;
      }

      const { outfitId } = req.body as { outfitId?: string };

      // Verify outfit ownership if provided
      if (outfitId) {
        const outfit = await prisma.outfit.findFirst({
          where: { id: outfitId, userId },
          include: { items: { include: { wardrobeItem: true } } },
        });
        if (!outfit) throw createError('Outfit not found', 404, 'OUTFIT_NOT_FOUND');
      }

      const vtonStatus = getVtonStatus();

      const job = await prisma.tryOnJob.create({
        data: {
          userId,
          outfitId: outfitId ?? null,
          referenceImagePath: req.file.path,
          provider: vtonStatus.provider,
          status: vtonStatus.configured ? 'PENDING' : 'FAILED',
          errorMessage: vtonStatus.configured
            ? null
            : 'Virtual try-on provider is not configured. Please set VTON_PROVIDER and VTON_API_KEY.',
        },
      });

      if (vtonStatus.configured) {
        // Process asynchronously (in production, use a job queue)
        setImmediate(async () => {
          try {
            // Get garment images from outfit
            const outfit = outfitId
              ? await prisma.outfit.findFirst({
                  where: { id: outfitId, userId },
                  include: { items: { include: { wardrobeItem: true } } },
                })
              : null;

            const garmentPaths = outfit?.items.map((i) => i.wardrobeItem.imagePath) ?? [];

            await prisma.tryOnJob.update({ where: { id: job.id }, data: { status: 'PROCESSING' } });

            const result = await processTryOn({
              referenceImagePath: req.file!.path,
              garmentImagePaths: garmentPaths,
              outfitName: outfit?.name ?? 'Custom Outfit',
            });

            await prisma.tryOnJob.update({
              where: { id: job.id },
              data: {
                status: 'COMPLETED',
                resultImagePath: result.resultImagePath,
                completedAt: new Date(),
                metadata: (result.metadata ?? {}) as Prisma.InputJsonValue,
              },
            });
          } catch (err) {
            await prisma.tryOnJob.update({
              where: { id: job.id },
              data: {
                status: 'FAILED',
                errorMessage: err instanceof Error ? err.message : 'Processing failed',
              },
            });
          }
        });
      }

      res.status(201).json({ success: true, data: job });
    } catch (err) { next(err); }
  }
);

// GET /api/v1/try-on/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.tryOnJob.findFirst({
      where: { id: req.params.id, userId: req.currentUserId! },
    });
    if (!job) throw createError('Try-on job not found', 404, 'JOB_NOT_FOUND');
    res.json({ success: true, data: job });
  } catch (err) { next(err); }
});

// POST /api/v1/try-on/:id/retry
router.post('/:id/retry', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.tryOnJob.findFirst({
      where: { id: req.params.id, userId: req.currentUserId! },
    });
    if (!job) throw createError('Try-on job not found', 404, 'JOB_NOT_FOUND');
    if (job.status !== 'FAILED') throw createError('Job can only be retried if it failed', 400, 'INVALID_STATE');
    if (job.retryCount >= 3) throw createError('Maximum retry attempts reached', 400, 'MAX_RETRIES');

    const updated = await prisma.tryOnJob.update({
      where: { id: job.id },
      data: { status: 'PENDING', retryCount: job.retryCount + 1, errorMessage: null },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// DELETE /api/v1/try-on/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.tryOnJob.findFirst({
      where: { id: req.params.id, userId: req.currentUserId! },
    });
    if (!job) throw createError('Try-on job not found', 404, 'JOB_NOT_FOUND');

    await prisma.tryOnJob.delete({ where: { id: job.id } });
    res.json({ success: true, data: { message: 'Try-on job deleted' } });
  } catch (err) { next(err); }
});

export default router;
