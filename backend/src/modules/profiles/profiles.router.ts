import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import {
  updateProfileSchema,
  updatePreferencesSchema,
  updateColorProfileSchema,
  updateMeasurementsSchema,
} from './profiles.schema';
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getColorProfile,
  updateColorProfile,
  getMeasurements,
  upsertMeasurements,
  deleteMeasurements,
} from './profiles.service';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getProfile(req.currentUserId!);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/', validate(updateProfileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await updateProfile(req.currentUserId!, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/preferences', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getPreferences(req.currentUserId!);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/preferences', validate(updatePreferencesSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await updatePreferences(req.currentUserId!, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/color-profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getColorProfile(req.currentUserId!);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/color-profile', validate(updateColorProfileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await updateColorProfile(req.currentUserId!, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/measurements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getMeasurements(req.currentUserId!);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/measurements', validate(updateMeasurementsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await upsertMeasurements(req.currentUserId!, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/measurements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteMeasurements(req.currentUserId!);
    res.json({ success: true, data: { message: 'Measurements deleted' } });
  } catch (err) { next(err); }
});

export default router;
