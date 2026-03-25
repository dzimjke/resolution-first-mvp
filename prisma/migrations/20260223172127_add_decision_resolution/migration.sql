-- AlterTable
ALTER TABLE "Decision" ADD COLUMN "observedUplift" REAL;
ALTER TABLE "Decision" ADD COLUMN "outcome" TEXT;
ALTER TABLE "Decision" ADD COLUMN "resolvedAt" DATETIME;
ALTER TABLE "Decision" ADD COLUMN "sampleSize" INTEGER;
