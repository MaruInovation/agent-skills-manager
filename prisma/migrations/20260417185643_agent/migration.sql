-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `_openid` CHAR(36) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `content` TEXT NOT NULL,
    `inputSchema` TEXT NOT NULL,
    `outputSchema` TEXT NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT true,
    `author_id` INTEGER NOT NULL,
    `_openid` CHAR(36) NULL,
    `examples` TEXT NULL,
    `errorHandling` TEXT NULL,
    `tags` VARCHAR(200) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NULL,
    `prompt` TEXT NOT NULL,
    `systemContent` TEXT NOT NULL,
    `model` VARCHAR(100) NOT NULL,
    `temperature` DOUBLE NOT NULL DEFAULT 0.2,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `author_id` INTEGER NOT NULL,
    `_openid` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AgentToSkill` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AgentToSkill_AB_unique`(`A`, `B`),
    INDEX `_AgentToSkill_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `skills` ADD CONSTRAINT `skills_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agents` ADD CONSTRAINT `agents_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentToSkill` ADD CONSTRAINT `_AgentToSkill_A_fkey` FOREIGN KEY (`A`) REFERENCES `agents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentToSkill` ADD CONSTRAINT `_AgentToSkill_B_fkey` FOREIGN KEY (`B`) REFERENCES `skills`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
