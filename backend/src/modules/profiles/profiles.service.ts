import prisma from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import type { UpdateProfileInput, UpdateColorProfileInput, UpdateMeasurementsInput, UpdatePreferencesInput } from './profiles.schema';

export async function getProfile(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });
  if (!profile) throw createError('Profile not found', 404, 'PROFILE_NOT_FOUND');
  return profile;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  return prisma.userProfile.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  });
}

export async function getPreferences(userId: string) {
  return prisma.stylePreference.findMany({ where: { userId } });
}

export async function updatePreferences(userId: string, input: UpdatePreferencesInput) {
  // Upsert each style preference
  const results = await Promise.all(
    input.preferences.map((pref) =>
      prisma.stylePreference.upsert({
        where: {
          // We need a compound unique here — handled via findFirst + create/update
          id: pref.id ?? '__new__',
        },
        create: { userId, styleType: pref.styleType, preferenceValue: pref.preferenceValue },
        update: { preferenceValue: pref.preferenceValue },
      })
    )
  );
  return results;
}

export async function getColorProfile(userId: string) {
  const profile = await prisma.colorProfile.findUnique({ where: { userId } });
  return profile;
}

export async function updateColorProfile(userId: string, input: UpdateColorProfileInput) {
  return prisma.colorProfile.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  });
}

export async function getMeasurements(userId: string) {
  return prisma.bodyMeasurement.findUnique({ where: { userId } });
}

export async function upsertMeasurements(userId: string, input: UpdateMeasurementsInput) {
  return prisma.bodyMeasurement.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  });
}

export async function deleteMeasurements(userId: string) {
  await prisma.bodyMeasurement.deleteMany({ where: { userId } });
}
