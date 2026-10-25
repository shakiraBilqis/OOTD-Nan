import { PrismaClient, ClothingCategory } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CLOSETTE development database...');
  console.log('⚠️  This is SAMPLE DATA for development only — not real user data\n');

  // ─── Demo User ─────────────────────────────────────────────────────────────
  const passwordHash = await argon2.hash('Demo@12345', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const user = await prisma.user.upsert({
    where: { email: 'demo@closette.app' },
    update: {},
    create: {
      name: 'Closette Demo',
      email: 'demo@closette.app',
      passwordHash,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          displayName: 'Style Demo',
          preferredLanguage: 'id',
          country: 'ID',
          onboardingDone: true,
          onboardingStep: 8,
        },
      },
      colorProfile: {
        create: {
          undertoneSuggestion: 'warm',
          paletteColors: ['#956344', '#E9C96D', '#C96F52', '#D6A6A5'],
          hairColor: 'dark brown',
          analysisMethod: 'QUIZ',
        },
      },
      bodyMeasurements: {
        create: {
          height: 162,
          chest: 86,
          waist: 68,
          hips: 92,
          unit: 'CM',
          bodyShape: 'hourglass',
          fitPreference: 'regular',
        },
      },
    },
    include: { profile: true },
  });

  console.log(`✅ Demo user: ${user.email}`);

  // ─── Style Preferences ─────────────────────────────────────────────────────
  const styleTypes = [
    { styleType: 'casual', preferenceValue: 5 },
    { styleType: 'minimalist', preferenceValue: 4 },
    { styleType: 'street', preferenceValue: 3 },
    { styleType: 'formal', preferenceValue: 2 },
    { styleType: 'bohemian', preferenceValue: 3 },
  ];

  for (const pref of styleTypes) {
    await prisma.stylePreference.upsert({
      where: { id: `seed-${user.id}-${pref.styleType}` },
      update: { preferenceValue: pref.preferenceValue },
      create: { id: `seed-${user.id}-${pref.styleType}`, userId: user.id, ...pref },
    });
  }

  // ─── Wardrobe Items ────────────────────────────────────────────────────────
  const sampleItems = [
    {
      name: 'White Linen Shirt',
      category: ClothingCategory.TOPS,
      subcategory: 'Shirt',
      dominantColor: '#FFFFFF',
      pattern: 'solid',
      fabricEstimate: 'linen',
      brand: 'Uniqlo',
      size: 'M',
      fit: 'regular',
      season: 'all-season',
      imagePath: 'uploads/wardrobe/sample-white-shirt.jpg',
      tags: ['casual', 'workwear', 'versatile'],
    },
    {
      name: 'High-Waist Cream Trousers',
      category: ClothingCategory.BOTTOMS,
      subcategory: 'Trousers',
      dominantColor: '#F7F2EA',
      pattern: 'solid',
      fabricEstimate: 'cotton',
      brand: 'Zara',
      size: 'M',
      fit: 'relaxed',
      season: 'spring',
      imagePath: 'uploads/wardrobe/sample-cream-trousers.jpg',
      tags: ['office', 'chic', 'neutral'],
    },
    {
      name: 'Cognac Leather Belt',
      category: ClothingCategory.ACCESSORIES,
      subcategory: 'Belt',
      dominantColor: '#956344',
      pattern: 'solid',
      fabricEstimate: 'leather',
      size: 'S/M',
      season: 'all-season',
      imagePath: 'uploads/wardrobe/sample-cognac-belt.jpg',
      tags: ['accessory', 'leather', 'warm-tones'],
    },
    {
      name: 'Camel Trench Coat',
      category: ClothingCategory.OUTERWEAR,
      subcategory: 'Trench Coat',
      dominantColor: '#C4985A',
      pattern: 'solid',
      fabricEstimate: 'wool blend',
      brand: 'Mango',
      size: 'M',
      fit: 'regular',
      season: 'autumn',
      imagePath: 'uploads/wardrobe/sample-camel-coat.jpg',
      tags: ['outerwear', 'classic', 'autumn'],
    },
    {
      name: 'Navy Straight Jeans',
      category: ClothingCategory.BOTTOMS,
      subcategory: 'Jeans',
      dominantColor: '#1E3A5F',
      pattern: 'solid',
      fabricEstimate: 'denim',
      brand: 'Levi\'s',
      size: '28',
      fit: 'regular',
      season: 'all-season',
      imagePath: 'uploads/wardrobe/sample-navy-jeans.jpg',
      tags: ['casual', 'denim', 'everyday'],
    },
    {
      name: 'Dusty Rose Silk Blouse',
      category: ClothingCategory.TOPS,
      subcategory: 'Blouse',
      dominantColor: '#D6A6A5',
      pattern: 'solid',
      fabricEstimate: 'silk',
      size: 'S',
      fit: 'relaxed',
      season: 'spring',
      imagePath: 'uploads/wardrobe/sample-rose-blouse.jpg',
      isFavorite: true,
      tags: ['elegant', 'feminine', 'date-night'],
    },
  ];

  let itemCount = 0;
  for (const item of sampleItems) {
    const { tags, ...rest } = item;
    await prisma.wardrobeItem.create({
      data: {
        userId: user.id,
        analysisStatus: 'COMPLETED',
        ...rest,
        tags: { create: tags.map((tag) => ({ tag })) },
      },
    });
    itemCount++;
  }

  console.log(`✅ Created ${itemCount} sample wardrobe items`);

  // ─── Consent ───────────────────────────────────────────────────────────────
  const consentTypes = ['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'AI_PROCESSING', 'PHOTO_ANALYSIS'] as const;
  for (const consentType of consentTypes) {
    await prisma.userConsent.upsert({
      where: { userId_consentType_version: { userId: user.id, consentType, version: '1.0' } },
      update: {},
      create: { userId: user.id, consentType, version: '1.0', grantedAt: new Date() },
    });
  }

  console.log('✅ Demo consents created');
  console.log('\n✨ Seeding complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Demo login: demo@closette.app');
  console.log('🔑 Demo password: Demo@12345');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
