const { createHash } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const DEFAULT_TEAM_CODE = "local-team-code";

function sha256(input) {
  return createHash("sha256").update(input).digest("hex");
}

async function main() {
  await prisma.session.deleteMany();
  await prisma.member.deleteMany();
  await prisma.expectation.deleteMany();
  await prisma.resolution.deleteMany();
  await prisma.postMortem.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.team.deleteMany();

  const team = await prisma.team.create({
    data: {
      name: "Local Team",
      inviteCodeHash: sha256(DEFAULT_TEAM_CODE)
    }
  });

  const decision = await prisma.decision.create({
    data: {
      teamId: team.id,
      title: "Roll out onboarding v2?",
      firstAction: "Create first project within 30 minutes",
      timeWindowMinutes: 30,
      thresholdPercent: 10,
      status: "ACTIVE",
      expectations: {
        create: [
          {
            role: "PRODUCT",
            choice: "YES",
            comment: "Expect clearer activation signal."
          },
          {
            role: "ANALYTICS",
            choice: "YES",
            comment: "Early cohorts show lift, still small sample."
          },
          {
            role: "ANALYTICS",
            choice: "NO",
            comment: "Concerned about power and novelty bias."
          },
          {
            role: "ENGINEERING",
            choice: "UNRESOLVED",
            comment: "Needs instrumentation audit before confidence."
          }
        ]
      },
      resolution: {
        create: {
          outcome: "UNRESOLVED",
          observedUplift: null,
          sampleSize: null,
          resolvedAt: null
        }
      },
      postMortem: {
        create: {
          businessErrorPp: null,
          expectationErrorPp: null,
          whatWeMisjudged: null,
          decisionTaken: null,
          learningCaptured: null
        }
      }
    }
  });

  console.log(`Seeded decision: ${decision.id}`);
  console.log(`Seeded team code: ${DEFAULT_TEAM_CODE}`);
  console.log(`Seeded team id: ${team.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
