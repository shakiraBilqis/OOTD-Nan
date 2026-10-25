import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import prisma from '../../config/database';
import { createError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate);

const savedLookSchema = z.object({
  outfitId: z.string().uuid().optional(),
  tryOnJobId: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).optional(),
  isFavorite: z.boolean().optional(),
});

// GET /api/v1/lookbook
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(String(req.query.page ?? '1'));
    const limit = Math.min(parseInt(String(req.query.limit ?? '20')), 100);
    const [items, total] = await Promise.all([
      prisma.savedLook.findMany({
        where: { userId: req.currentUserId! },
        include: { outfit: { include: { items: { include: { wardrobeItem: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.savedLook.count({ where: { userId: req.currentUserId! } }),
    ]);
    res.json({ success: true, data: { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
  } catch (err) { next(err); }
});

// POST /api/v1/lookbook
router.post('/', validate(savedLookSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.savedLook.create({
      data: { userId: req.currentUserId!, ...req.body },
      include: { outfit: true },
    });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/v1/lookbook/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const look = await prisma.savedLook.findFirst({
      where: { id: req.params.id, userId: req.currentUserId! },
      include: { outfit: { include: { items: { include: { wardrobeItem: true } } } }, tryOnJob: true },
    });
    if (!look) throw createError('Saved look not found', 404, 'NOT_FOUND');
    res.json({ success: true, data: look });
  } catch (err) { next(err); }
});

// PATCH /api/v1/lookbook/:id
router.patch('/:id', validate(savedLookSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const look = await prisma.savedLook.findFirst({ where: { id: req.params.id, userId: req.currentUserId! } });
    if (!look) throw createError('Saved look not found', 404, 'NOT_FOUND');
    const data = await prisma.savedLook.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// DELETE /api/v1/lookbook/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const look = await prisma.savedLook.findFirst({ where: { id: req.params.id, userId: req.currentUserId! } });
    if (!look) throw createError('Saved look not found', 404, 'NOT_FOUND');
    await prisma.savedLook.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Saved look deleted' } });
  } catch (err) { next(err); }
});

export default router;
