PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "inviteCodeHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Team_inviteCodeHash_key" ON "Team"("inviteCodeHash");

INSERT INTO "Team" ("id", "name", "inviteCodeHash", "createdAt")
VALUES ('team_local_seed', 'Local Team', '58fd495a49c42ff2873e92bd62c9309a6094bb0809d7c14273747da6f3c262df', CURRENT_TIMESTAMP);

CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" TEXT NOT NULL,
    CONSTRAINT "Member_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Member_teamId_email_key" ON "Member"("teamId", "email");

CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "memberId" TEXT NOT NULL,
    CONSTRAINT "Session_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

CREATE TABLE "new_Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "firstAction" TEXT NOT NULL,
    "timeWindowMinutes" INTEGER NOT NULL,
    "thresholdPercent" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "observedUplift" REAL,
    "sampleSize" INTEGER,
    "resolvedAt" DATETIME,
    "outcome" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Decision_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Decision" (
    "id",
    "title",
    "firstAction",
    "timeWindowMinutes",
    "thresholdPercent",
    "status",
    "teamId",
    "observedUplift",
    "sampleSize",
    "resolvedAt",
    "outcome",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "title",
    "firstAction",
    "timeWindowMinutes",
    "thresholdPercent",
    "status",
    'team_local_seed',
    "observedUplift",
    "sampleSize",
    "resolvedAt",
    "outcome",
    "createdAt",
    "updatedAt"
FROM "Decision";

DROP TABLE "Decision";
ALTER TABLE "new_Decision" RENAME TO "Decision";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
