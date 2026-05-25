-- CreateEnum
CREATE TYPE "PlantDifficulty" AS ENUM ('VERY_EASY', 'EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "UserPlantStatus" AS ENUM ('PLANNED', 'GROWING', 'WAITING_FOR_SPROUTS', 'SPROUTED', 'HARVESTING', 'FINISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PlantStageKey" AS ENUM ('SOWING', 'WAITING_FOR_SPROUTS', 'FIRST_LEAVES', 'GROWTH', 'PINCHING', 'HARVEST', 'CUSTOM');

-- CreateEnum
CREATE TYPE "Place" AS ENUM ('WINDOWSILL', 'BALCONY', 'GROW_LIGHT_SHELF', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "LightCondition" AS ENUM ('FULL_DAY', 'FEW_HOURS', 'LOW_LIGHT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ContainerType" AS ENUM ('SMALL_POT', 'LONG_BOX', 'CONTAINER', 'NOT_READY');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('WATERING', 'CHECK_MOISTURE', 'VENTILATION', 'LIGHT', 'COVER', 'THINNING', 'PINCHING', 'HARVEST', 'OBSERVATION', 'CUSTOM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" "PlantDifficulty" NOT NULL DEFAULT 'EASY',
    "description" TEXT NOT NULL,
    "lightRequirement" TEXT NOT NULL,
    "waterRequirement" TEXT NOT NULL,
    "averageGerminationDays" INTEGER NOT NULL,
    "averageHarvestDays" INTEGER NOT NULL,
    "recommendedContainer" TEXT NOT NULL,
    "sowingDepth" TEXT,
    "temperature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plantCatalogId" TEXT NOT NULL,
    "customName" TEXT,
    "status" "UserPlantStatus" NOT NULL DEFAULT 'WAITING_FOR_SPROUTS',
    "plantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentStage" "PlantStageKey" NOT NULL DEFAULT 'SOWING',
    "place" "Place" NOT NULL DEFAULT 'UNKNOWN',
    "lightCondition" "LightCondition" NOT NULL DEFAULT 'UNKNOWN',
    "containerType" "ContainerType" NOT NULL DEFAULT 'NOT_READY',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareTask" (
    "id" TEXT NOT NULL,
    "userPlantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "taskType" "TaskType" NOT NULL DEFAULT 'CUSTOM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantStage" (
    "id" TEXT NOT NULL,
    "plantCatalogId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stageKey" "PlantStageKey" NOT NULL DEFAULT 'CUSTOM',
    "dayFrom" INTEGER NOT NULL,
    "dayTo" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantDiaryEntry" (
    "id" TEXT NOT NULL,
    "userPlantId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantDiaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PlantCatalog_name_key" ON "PlantCatalog"("name");

-- CreateIndex
CREATE INDEX "PlantCatalog_type_idx" ON "PlantCatalog"("type");

-- CreateIndex
CREATE INDEX "PlantCatalog_difficulty_idx" ON "PlantCatalog"("difficulty");

-- CreateIndex
CREATE INDEX "UserPlant_userId_idx" ON "UserPlant"("userId");

-- CreateIndex
CREATE INDEX "UserPlant_plantCatalogId_idx" ON "UserPlant"("plantCatalogId");

-- CreateIndex
CREATE INDEX "UserPlant_status_idx" ON "UserPlant"("status");

-- CreateIndex
CREATE INDEX "UserPlant_plantedAt_idx" ON "UserPlant"("plantedAt");

-- CreateIndex
CREATE INDEX "CareTask_userPlantId_idx" ON "CareTask"("userPlantId");

-- CreateIndex
CREATE INDEX "CareTask_dueDate_idx" ON "CareTask"("dueDate");

-- CreateIndex
CREATE INDEX "CareTask_isCompleted_idx" ON "CareTask"("isCompleted");

-- CreateIndex
CREATE INDEX "CareTask_taskType_idx" ON "CareTask"("taskType");

-- CreateIndex
CREATE INDEX "PlantStage_plantCatalogId_idx" ON "PlantStage"("plantCatalogId");

-- CreateIndex
CREATE INDEX "PlantStage_stageKey_idx" ON "PlantStage"("stageKey");

-- CreateIndex
CREATE UNIQUE INDEX "PlantStage_plantCatalogId_order_key" ON "PlantStage"("plantCatalogId", "order");

-- CreateIndex
CREATE INDEX "PlantDiaryEntry_userPlantId_idx" ON "PlantDiaryEntry"("userPlantId");

-- CreateIndex
CREATE INDEX "PlantDiaryEntry_createdAt_idx" ON "PlantDiaryEntry"("createdAt");

-- AddForeignKey
ALTER TABLE "UserPlant" ADD CONSTRAINT "UserPlant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlant" ADD CONSTRAINT "UserPlant_plantCatalogId_fkey" FOREIGN KEY ("plantCatalogId") REFERENCES "PlantCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareTask" ADD CONSTRAINT "CareTask_userPlantId_fkey" FOREIGN KEY ("userPlantId") REFERENCES "UserPlant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantStage" ADD CONSTRAINT "PlantStage_plantCatalogId_fkey" FOREIGN KEY ("plantCatalogId") REFERENCES "PlantCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantDiaryEntry" ADD CONSTRAINT "PlantDiaryEntry_userPlantId_fkey" FOREIGN KEY ("userPlantId") REFERENCES "UserPlant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
