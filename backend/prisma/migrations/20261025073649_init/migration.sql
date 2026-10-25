-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `userAgent` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_token_key`(`token`),
    INDEX `sessions_userId_idx`(`userId`),
    INDEX `sessions_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_tokenHash_key`(`tokenHash`),
    INDEX `password_reset_tokens_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NULL,
    `avatarPath` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `preferredLanguage` VARCHAR(191) NOT NULL DEFAULT 'id',
    `country` VARCHAR(191) NULL,
    `preferredUnit` ENUM('CM', 'INCH') NOT NULL DEFAULT 'CM',
    `onboardingStep` INTEGER NOT NULL DEFAULT 0,
    `onboardingDone` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `style_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `styleType` VARCHAR(191) NOT NULL,
    `preferenceValue` INTEGER NOT NULL DEFAULT 3,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `style_preferences_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `color_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `undertoneSuggestion` VARCHAR(191) NULL,
    `paletteColors` JSON NULL,
    `avoidColors` JSON NULL,
    `hairColor` VARCHAR(191) NULL,
    `eyeColor` VARCHAR(191) NULL,
    `skinToneDescription` VARCHAR(191) NULL,
    `analysisMethod` ENUM('QUIZ', 'PHOTO', 'MANUAL') NOT NULL DEFAULT 'QUIZ',
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `color_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `body_measurements` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `height` DECIMAL(5, 2) NULL,
    `chest` DECIMAL(5, 2) NULL,
    `waist` DECIMAL(5, 2) NULL,
    `hips` DECIMAL(5, 2) NULL,
    `shoulderWidth` DECIMAL(5, 2) NULL,
    `inseam` DECIMAL(5, 2) NULL,
    `unit` ENUM('CM', 'INCH') NOT NULL DEFAULT 'CM',
    `bodyShape` VARCHAR(191) NULL,
    `fitPreference` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `body_measurements_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wardrobe_items` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('TOPS', 'BOTTOMS', 'DRESSES', 'OUTERWEAR', 'SHOES', 'BAGS', 'ACCESSORIES', 'ACTIVEWEAR', 'UNDERWEAR', 'OTHER') NOT NULL,
    `subcategory` VARCHAR(191) NULL,
    `imagePath` VARCHAR(191) NOT NULL,
    `thumbnailPath` VARCHAR(191) NULL,
    `dominantColor` VARCHAR(191) NULL,
    `secondaryColors` JSON NULL,
    `pattern` VARCHAR(191) NULL,
    `fabricEstimate` VARCHAR(191) NULL,
    `brand` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `fit` VARCHAR(191) NULL,
    `season` VARCHAR(191) NULL,
    `isFavorite` BOOLEAN NOT NULL DEFAULT false,
    `analysisStatus` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
    `analysisData` JSON NULL,
    `notes` TEXT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `wardrobe_items_userId_idx`(`userId`),
    INDEX `wardrobe_items_category_idx`(`category`),
    INDEX `wardrobe_items_userId_isFavorite_idx`(`userId`, `isFavorite`),
    INDEX `wardrobe_items_userId_isArchived_idx`(`userId`, `isArchived`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wardrobe_item_tags` (
    `id` VARCHAR(191) NOT NULL,
    `wardrobeItemId` VARCHAR(191) NOT NULL,
    `tag` VARCHAR(191) NOT NULL,

    INDEX `wardrobe_item_tags_wardrobeItemId_idx`(`wardrobeItemId`),
    INDEX `wardrobe_item_tags_tag_idx`(`tag`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `styling_requests` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `occasion` VARCHAR(191) NOT NULL,
    `formality` VARCHAR(191) NULL,
    `weatherPreference` VARCHAR(191) NULL,
    `stylePreferences` JSON NULL,
    `colorPreferences` JSON NULL,
    `avoidColors` JSON NULL,
    `comfortPriority` INTEGER NULL DEFAULT 3,
    `selectedItemIds` JSON NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `styling_requests_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outfits` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `stylingRequestId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `occasion` VARCHAR(191) NOT NULL,
    `colorPalette` JSON NULL,
    `recommendationData` JSON NULL,
    `stylingTips` JSON NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `outfits_userId_idx`(`userId`),
    INDEX `outfits_userId_status_idx`(`userId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outfit_items` (
    `id` VARCHAR(191) NOT NULL,
    `outfitId` VARCHAR(191) NOT NULL,
    `wardrobeItemId` VARCHAR(191) NOT NULL,
    `slot` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    INDEX `outfit_items_outfitId_idx`(`outfitId`),
    INDEX `outfit_items_wardrobeItemId_idx`(`wardrobeItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `try_on_jobs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `outfitId` VARCHAR(191) NULL,
    `referenceImagePath` VARCHAR(191) NOT NULL,
    `resultImagePath` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NOT NULL,
    `modelId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `errorMessage` TEXT NULL,
    `retryCount` INTEGER NOT NULL DEFAULT 0,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,

    INDEX `try_on_jobs_userId_idx`(`userId`),
    INDEX `try_on_jobs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saved_looks` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `outfitId` VARCHAR(191) NULL,
    `tryOnJobId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `tags` JSON NULL,
    `isFavorite` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `saved_looks_tryOnJobId_key`(`tryOnJobId`),
    INDEX `saved_looks_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outfit_plans` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `outfitId` VARCHAR(191) NOT NULL,
    `plannedDate` DATE NOT NULL,
    `occasion` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `outfit_plans_userId_idx`(`userId`),
    INDEX `outfit_plans_userId_plannedDate_idx`(`userId`, `plannedDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_consents` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `consentType` ENUM('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'AI_PROCESSING', 'PHOTO_ANALYSIS', 'DATA_RETENTION', 'MARKETING') NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `grantedAt` DATETIME(3) NULL,
    `withdrawnAt` DATETIME(3) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_consents_userId_idx`(`userId`),
    UNIQUE INDEX `user_consents_userId_consentType_version_key`(`userId`, `consentType`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_events` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_events_userId_idx`(`userId`),
    INDEX `audit_events_eventType_idx`(`eventType`),
    INDEX `audit_events_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `style_preferences` ADD CONSTRAINT `style_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `color_profiles` ADD CONSTRAINT `color_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `body_measurements` ADD CONSTRAINT `body_measurements_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wardrobe_items` ADD CONSTRAINT `wardrobe_items_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wardrobe_item_tags` ADD CONSTRAINT `wardrobe_item_tags_wardrobeItemId_fkey` FOREIGN KEY (`wardrobeItemId`) REFERENCES `wardrobe_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `styling_requests` ADD CONSTRAINT `styling_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outfits` ADD CONSTRAINT `outfits_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outfits` ADD CONSTRAINT `outfits_stylingRequestId_fkey` FOREIGN KEY (`stylingRequestId`) REFERENCES `styling_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outfit_items` ADD CONSTRAINT `outfit_items_outfitId_fkey` FOREIGN KEY (`outfitId`) REFERENCES `outfits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outfit_items` ADD CONSTRAINT `outfit_items_wardrobeItemId_fkey` FOREIGN KEY (`wardrobeItemId`) REFERENCES `wardrobe_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `try_on_jobs` ADD CONSTRAINT `try_on_jobs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `try_on_jobs` ADD CONSTRAINT `try_on_jobs_outfitId_fkey` FOREIGN KEY (`outfitId`) REFERENCES `outfits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saved_looks` ADD CONSTRAINT `saved_looks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saved_looks` ADD CONSTRAINT `saved_looks_outfitId_fkey` FOREIGN KEY (`outfitId`) REFERENCES `outfits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saved_looks` ADD CONSTRAINT `saved_looks_tryOnJobId_fkey` FOREIGN KEY (`tryOnJobId`) REFERENCES `try_on_jobs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outfit_plans` ADD CONSTRAINT `outfit_plans_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outfit_plans` ADD CONSTRAINT `outfit_plans_outfitId_fkey` FOREIGN KEY (`outfitId`) REFERENCES `outfits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_consents` ADD CONSTRAINT `user_consents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_events` ADD CONSTRAINT `audit_events_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
