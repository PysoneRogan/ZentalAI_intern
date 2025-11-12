-- AlterTable
ALTER TABLE `plan_days` ADD COLUMN `ai_exercise_data` JSON NULL;

-- AlterTable
ALTER TABLE `plans` ADD COLUMN `ai_generated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `ai_generation_cost` DECIMAL(8, 4) NULL,
    ADD COLUMN `ai_model_version` VARCHAR(50) NULL,
    ADD COLUMN `ai_prompt_data` JSON NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `auth0_id` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `workout_types` MODIFY `description` TEXT NULL,
    MODIFY `color` VARCHAR(7) NOT NULL DEFAULT '#3b82f6';

-- CreateTable
CREATE TABLE `ai_usage_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `request_type` VARCHAR(50) NOT NULL,
    `prompt_tokens` INTEGER NOT NULL,
    `completion_tokens` INTEGER NOT NULL,
    `total_tokens` INTEGER NOT NULL,
    `cost` DECIMAL(8, 4) NOT NULL,
    `model` VARCHAR(50) NOT NULL,
    `success` BOOLEAN NOT NULL,
    `error_message` TEXT NULL,
    `request_duration` INTEGER NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_ai_usage_user_time`(`user_id`, `timestamp`),
    INDEX `idx_ai_usage_time`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `idx_plan_completed_day` ON `plan_days`(`plan_id`, `is_completed`, `day_of_week`);

-- CreateIndex
CREATE INDEX `idx_type_completed` ON `plan_days`(`workout_type_id`, `is_completed`);

-- CreateIndex
CREATE INDEX `idx_plan_type` ON `plan_days`(`plan_id`, `workout_type_id`);

-- CreateIndex
CREATE INDEX `idx_user_active_week` ON `plans`(`user_id`, `is_active`, `week_start`);

-- CreateIndex
CREATE INDEX `idx_active_created` ON `plans`(`is_active`, `created_at`);

-- CreateIndex
CREATE INDEX `idx_plans_ai_generated` ON `plans`(`ai_generated`, `user_id`);

-- CreateIndex
CREATE INDEX `idx_email_created` ON `users`(`email`, `created_at`);

-- CreateIndex
CREATE INDEX `idx_name_created` ON `users`(`name`, `created_at`);

-- CreateIndex
CREATE INDEX `idx_auth0_id` ON `users`(`auth0_id`);

-- CreateIndex
CREATE INDEX `idx_user_type_date` ON `workouts`(`user_id`, `workout_type_id`, `performed_at`);

-- CreateIndex
CREATE INDEX `idx_date_type` ON `workouts`(`performed_at`, `workout_type_id`);

-- CreateIndex
CREATE INDEX `idx_user_created` ON `workouts`(`user_id`, `created_at`);

-- CreateIndex
CREATE INDEX `idx_duration_calories` ON `workouts`(`duration_min`, `calories`);

-- AddForeignKey
ALTER TABLE `ai_usage_logs` ADD CONSTRAINT `ai_usage_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
