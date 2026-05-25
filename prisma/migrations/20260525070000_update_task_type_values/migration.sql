-- Preserve existing CareTask rows while replacing the enum with the new task taxonomy.
ALTER TYPE "TaskType" RENAME TO "TaskType_old";

CREATE TYPE "TaskType" AS ENUM (
  'WATER_CHECK',
  'VENTILATE',
  'LIGHT',
  'THINNING',
  'PINCHING',
  'HARVEST',
  'NOTE',
  'OTHER'
);

ALTER TABLE "CareTask" ALTER COLUMN "taskType" DROP DEFAULT;

ALTER TABLE "CareTask"
ALTER COLUMN "taskType" TYPE "TaskType"
USING (
  CASE "taskType"::text
    WHEN 'WATERING' THEN 'WATER_CHECK'
    WHEN 'CHECK_MOISTURE' THEN 'WATER_CHECK'
    WHEN 'VENTILATION' THEN 'VENTILATE'
    WHEN 'COVER' THEN 'OTHER'
    WHEN 'OBSERVATION' THEN 'NOTE'
    WHEN 'CUSTOM' THEN 'OTHER'
    ELSE "taskType"::text
  END
)::"TaskType";

ALTER TABLE "CareTask" ALTER COLUMN "taskType" SET DEFAULT 'OTHER';

DROP TYPE "TaskType_old";
