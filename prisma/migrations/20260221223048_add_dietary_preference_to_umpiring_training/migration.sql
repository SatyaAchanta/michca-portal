-- CreateEnum
CREATE TYPE "DietaryPreference" AS ENUM ('VEGETARIAN', 'NON_VEGETARIAN');

-- AlterTable
ALTER TABLE "UmpiringTraining" ADD COLUMN     "dietaryPreference" "DietaryPreference" NOT NULL DEFAULT 'VEGETARIAN';
