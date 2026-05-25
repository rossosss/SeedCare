-- CreateEnum
CREATE TYPE "CareMode" AS ENUM ('SIMPLE', 'EXPERT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "careMode" "CareMode" NOT NULL DEFAULT 'SIMPLE',
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
