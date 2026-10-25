import path from 'path';
import fs from 'fs';
import prisma from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { config } from '../../config';
import type { CreateWardrobeItemInput, UpdateWardrobeItemInput } from './wardrobe.schema';

export async function listWardrobeItems(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    favorites?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) {
  const page = options.page ?? 1;
  const limit = Math.min(options.limit ?? 20, 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    userId,
    isArchived: false,
    ...(options.category ? { category: options.category } : {}),
    ...(options.favorites === true ? { isFavorite: true } : {}),
    ...(options.search
      ? {
          OR: [
            { name: { contains: options.search } },
            { brand: { contains: options.search } },
            { tags: { some: { tag: { contains: options.search } } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.wardrobeItem.findMany({
      where,
      include: { tags: true },
      orderBy: { [options.sortBy ?? 'createdAt']: options.sortOrder ?? 'desc' },
      skip,
      take: limit,
    }),
    prisma.wardrobeItem.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getWardrobeItem(id: string, userId: string) {
  const item = await prisma.wardrobeItem.findFirst({
    where: { id, userId, isArchived: false },
    include: { tags: true },
  });
  if (!item) throw createError('Wardrobe item not found', 404, 'ITEM_NOT_FOUND');
  return item;
}

export async function createWardrobeItem(
  userId: string,
  input: CreateWardrobeItemInput,
  imagePath: string,
  thumbnailPath?: string
) {
  const { tags, ...rest } = input;

  return prisma.wardrobeItem.create({
    data: {
      userId,
      imagePath,
      thumbnailPath,
      ...rest,
      tags: tags?.length
        ? { create: tags.map((tag) => ({ tag })) }
        : undefined,
    },
    include: { tags: true },
  });
}

export async function updateWardrobeItem(
  id: string,
  userId: string,
  input: UpdateWardrobeItemInput
) {
  await assertOwnership(id, userId);
  const { tags, ...rest } = input;

  return prisma.$transaction(async (tx) => {
    if (tags !== undefined) {
      await tx.wardrobeItemTag.deleteMany({ where: { wardrobeItemId: id } });
    }
    return tx.wardrobeItem.update({
      where: { id },
      data: {
        ...rest,
        ...(tags !== undefined
          ? { tags: { create: tags.map((tag) => ({ tag })) } }
          : {}),
      },
      include: { tags: true },
    });
  });
}

export async function deleteWardrobeItem(id: string, userId: string) {
  const item = await assertOwnership(id, userId);

  // Delete physical files
  deleteFileIfExists(item.imagePath);
  if (item.thumbnailPath) deleteFileIfExists(item.thumbnailPath);

  await prisma.wardrobeItem.delete({ where: { id } });
}

export async function toggleFavorite(id: string, userId: string) {
  const item = await assertOwnership(id, userId);
  return prisma.wardrobeItem.update({
    where: { id },
    data: { isFavorite: !item.isFavorite },
    select: { id: true, isFavorite: true },
  });
}

export async function analyzeWardrobeItem(id: string, userId: string) {
  await assertOwnership(id, userId);

  await prisma.wardrobeItem.update({
    where: { id },
    data: { analysisStatus: 'PROCESSING' },
  });

  // Actual analysis delegated to job queue / AI service
  // Returns job reference for polling
  return { id, status: 'PROCESSING', message: 'Analysis queued' };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function assertOwnership(id: string, userId: string) {
  const item = await prisma.wardrobeItem.findFirst({ where: { id, userId } });
  if (!item) throw createError('Wardrobe item not found', 404, 'ITEM_NOT_FOUND');
  return item;
}

function deleteFileIfExists(filePath: string): void {
  try {
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(config.storage.uploadDir, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch {
    // Log but don't throw — deletion failure should not block DB cleanup
    console.warn(`[Storage] Could not delete file: ${filePath}`);
  }
}
