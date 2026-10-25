import { z } from 'zod';

const categories = ['TOPS', 'BOTTOMS', 'DRESSES', 'OUTERWEAR', 'SHOES', 'BAGS', 'ACCESSORIES', 'ACTIVEWEAR', 'UNDERWEAR', 'OTHER'] as const;

export const createWardrobeItemSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.enum(categories),
  subcategory: z.string().max(100).optional(),
  dominantColor: z.string().max(10).optional(),
  secondaryColors: z.array(z.string().max(10)).optional(),
  pattern: z.string().max(50).optional(),
  fabricEstimate: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  size: z.string().max(20).optional(),
  fit: z.enum(['slim', 'regular', 'relaxed', 'oversized']).optional(),
  season: z.enum(['spring', 'summer', 'autumn', 'winter', 'all-season']).optional(),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).optional(),
});

export const updateWardrobeItemSchema = createWardrobeItemSchema.partial();

export const wardrobeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  search: z.string().max(100).optional(),
  favorites: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'name', 'category', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateWardrobeItemInput = z.infer<typeof createWardrobeItemSchema>;
export type UpdateWardrobeItemInput = z.infer<typeof updateWardrobeItemSchema>;
export type WardrobeQuery = z.infer<typeof wardrobeQuerySchema>;
