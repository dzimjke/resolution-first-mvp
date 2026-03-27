const { PrismaClient } = require("@prisma/client");
const { createHash } = require("node:crypto");

const prisma = new PrismaClient();

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

async function main() {
  const teamCode = process.env.TEAM_CODE ?? process.argv[2];
  const teamName = process.env.TEAM_NAME ?? process.argv[3] ?? null;

  if (!teamCode) {
    throw new Error("Usage: npm run create:team -- <TEAM_CODE> [TEAM_NAME]");
  }

  const inviteCodeHash = sha256(teamCode);
  const existingTeam = await prisma.team.findUnique({
    where: { inviteCodeHash }
  });

  const team =
    existingTeam ??
    (await prisma.team.create({
      data: {
        name: teamName,
        inviteCodeHash
      }
    }));

  console.log(`teamCode=${teamCode}`);
  console.log(`inviteCodeHash=${inviteCodeHash}`);
  console.log(`teamId=${team.id}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
