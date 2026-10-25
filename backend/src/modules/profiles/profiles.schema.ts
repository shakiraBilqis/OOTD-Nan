import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  preferredLanguage: z.string().max(10).optional(),
  country: z.string().max(50).optional(),
  preferredUnit: z.enum(['CM', 'INCH']).optional(),
});

export const updatePreferencesSchema = z.object({
  preferences: z.array(
    z.object({
      id: z.string().optional(),
      styleType: z.string().min(1).max(50),
      preferenceValue: z.number().int().min(1).max(5),
    })
  ).min(1),
});

export const updateColorProfileSchema = z.object({
  undertoneSuggestion: z.enum(['warm', 'cool', 'neutral']).optional(),
  paletteColors: z.array(z.string()).optional(),
  avoidColors: z.array(z.string()).optional(),
  hairColor: z.string().max(50).optional(),
  eyeColor: z.string().max(50).optional(),
  skinToneDescription: z.string().max(200).optional(),
  analysisMethod: z.enum(['QUIZ', 'PHOTO', 'MANUAL']).optional(),
});

export const updateMeasurementsSchema = z.object({
  height: z.number().positive().optional(),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hips: z.number().positive().optional(),
  shoulderWidth: z.number().positive().optional(),
  inseam: z.number().positive().optional(),
  unit: z.enum(['CM', 'INCH']).optional(),
  bodyShape: z.string().max(50).optional(),
  fitPreference: z.string().max(50).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type UpdateColorProfileInput = z.infer<typeof updateColorProfileSchema>;
export type UpdateMeasurementsInput = z.infer<typeof updateMeasurementsSchema>;
