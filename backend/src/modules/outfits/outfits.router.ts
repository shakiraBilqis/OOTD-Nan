import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import prisma from '../../config/database';
import { createError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate);

// GET /api/v1/outfits
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1')));
    const limit = Math.min(50, parseInt(String(req.query.limit ?? '20')));
    const [outfits, total] = await Promise.all([
      prisma.outfit.findMany({
        where: { userId: req.currentUserId! },
        include: { items: { include: { wardrobeItem: { include: { tags: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.outfit.count({ where: { userId: req.currentUserId! } }),
    ]);
    res.json({ success: true, data: { outfits, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
  } catch (err) { next(err); }
});

// GET /api/v1/outfits/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outfit = await prisma.outfit.findFirst({
      where: { id: req.params.id, userId: req.currentUserId! },
      include: { items: { include: { wardrobeItem: { include: { tags: true } } } } },
    });
    if (!outfit) throw createError('Outfit not found', 404, 'NOT_FOUND');
    res.json({ success: true, data: outfit });
  } catch (err) { next(err); }
});

// PATCH /api/v1/outfits/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outfit = await prisma.outfit.findFirst({ where: { id: req.params.id, userId: req.currentUserId! } });
    if (!outfit) throw createError('Outfit not found', 404, 'NOT_FOUND');
    const updated = await prisma.outfit.update({
      where: { id: req.params.id },
      data: { name: req.body.name, description: req.body.description, status: req.body.status },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// DELETE /api/v1/outfits/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outfit = await prisma.outfit.findFirst({ where: { id: req.params.id, userId: req.currentUserId! } });
    if (!outfit) throw createError('Outfit not found', 404, 'NOT_FOUND');
    await prisma.outfit.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Outfit deleted' } });
  } catch (err) { next(err); }
});

export default router;
