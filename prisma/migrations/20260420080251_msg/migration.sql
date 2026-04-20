-- CreateTable
CREATE TABLE `chat_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_id` CHAR(36) NOT NULL,
    `message` LONGTEXT NOT NULL,
    `agent_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `chat_messages_conversation_id_created_at_idx`(`conversation_id`, `created_at`),
    INDEX `chat_messages_agent_id_idx`(`agent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
