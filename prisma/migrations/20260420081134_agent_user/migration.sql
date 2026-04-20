/*
  Warnings:

  - Added the required column `user_id` to the `chat_messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chat_messages` ADD COLUMN `user_id` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `chat_messages_user_id_conversation_id_created_at_idx` ON `chat_messages`(`user_id`, `conversation_id`, `created_at`);

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
