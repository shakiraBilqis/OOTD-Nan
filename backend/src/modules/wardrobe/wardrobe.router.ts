import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate, validateQuery } from '../../middleware/validate';
import { wardrobeUpload, handleUploadError } from '../../middleware/upload';
import {
  createWardrobeItemSchema,
  updateWardrobeItemSchema,
  wardrobeQuerySchema,
} from './wardrobe.schema';
import {
  listWardrobeItems,
  getWardrobeItem,
  createWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
  toggleFavorite,
  analyzeWardrobeItem,
} from './wardrobe.service';

const router = Router();
router.use(authenticate);

// GET /api/v1/wardrobe
router.get('/', validateQuery(wardrobeQuerySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await listWardrobeItems(req.currentUserId!, req.query as Record<string, unknown>);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/v1/wardrobe/upload — upload image first, then create item
router.post(
  '/upload',
  wardrobeUpload.single('image'),
  handleUploadError,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Image file is required' } });
        return;
      }
      res.json({
        success: true,
        data: {
          imagePath: req.file.path,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (err) { next(err); }
  }
);

// POST /api/v1/wardrobe
router.post('/', validate(createWardrobeItemSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const imagePath = req.body.imagePath as string;
    if (!imagePath) {
      res.status(400).json({ success: false, error: { code: 'NO_IMAGE', message: 'imagePath is required — upload image first' } });
      return;
    }
    const data = await createWardrobeItem(req.currentUserId!, req.body, imagePath);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/v1/wardrobe/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getWardrobeItem(req.params.id, req.currentUserId!);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// PATCH /api/v1/wardrobe/:id
router.patch('/:id', validate(updateWardrobeItemSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await updateWardrobeItem(req.params.id, req.currentUserId!, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// DELETE /api/v1/wardrobe/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteWardrobeItem(req.params.id, req.currentUserId!);
    res.json({ success: true, data: { message: 'Item deleted' } });
  } catch (err) { next(err); }
});

// POST /api/v1/wardrobe/:id/favorite
router.post('/:id/favorite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await toggleFavorite(req.params.id, req.currentUserId!);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/v1/wardrobe/:id/analyze
router.post('/:id/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyzeWardrobeItem(req.params.id, req.currentUserId!);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
