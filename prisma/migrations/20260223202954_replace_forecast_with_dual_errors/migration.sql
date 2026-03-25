/*
  Warnings:

  - You are about to drop the column `forecastErrorPp` on the `Decision` table. All the data in the column will be lost.
  - You are about to drop the column `forecastErrorPp` on the `PostMortem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "firstAction" TEXT NOT NULL,
    "timeWindowMinutes" INTEGER NOT NULL,
    "thresholdPercent" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "observedUplift" REAL,
    "sampleSize" INTEGER,
    "resolvedAt" DATETIME,
    "outcome" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Decision" ("createdAt", "firstAction", "id", "observedUplift", "outcome", "resolvedAt", "sampleSize", "status", "thresholdPercent", "timeWindowMinutes", "title", "updatedAt") SELECT "createdAt", "firstAction", "id", "observedUplift", "outcome", "resolvedAt", "sampleSize", "status", "thresholdPercent", "timeWindowMinutes", "title", "updatedAt" FROM "Decision";
DROP TABLE "Decision";
ALTER TABLE "new_Decision" RENAME TO "Decision";
CREATE TABLE "new_PostMortem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "decisionId" TEXT NOT NULL,
    "businessErrorPp" REAL,
    "expectationErrorPp" REAL,
    "whatWeMisjudged" TEXT,
    "decisionTaken" TEXT,
    "learningCaptured" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostMortem_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PostMortem" ("businessErrorPp", "createdAt", "decisionId", "decisionTaken", "id", "learningCaptured", "whatWeMisjudged") SELECT "businessErrorPp", "createdAt", "decisionId", "decisionTaken", "id", "learningCaptured", "whatWeMisjudged" FROM "PostMortem";
DROP TABLE "PostMortem";
ALTER TABLE "new_PostMortem" RENAME TO "PostMortem";
CREATE UNIQUE INDEX "PostMortem_decisionId_key" ON "PostMortem"("decisionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
