import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { randomToken, sha256 } from "@/lib/security";
import { setSessionCookie } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  teamCode: z.string().trim().min(1)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid email and team code are required." },
        { status: 400 }
      );
    }

    const { email, teamCode } = parsed.data;
    const inviteCodeHash = sha256(teamCode);

    const team = await prisma.team.findUnique({
      where: { inviteCodeHash },
      select: { id: true }
    });

    if (!team) {
      return NextResponse.json(
        { error: "Invalid team code" },
        { status: 401 }
      );
    }

    const member = await prisma.member.upsert({
      where: {
        teamId_email: {
          teamId: team.id,
          email
        }
      },
      update: {},
      create: {
        email,
        teamId: team.id
      }
    });

    const token = randomToken(32);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        tokenHash: sha256(token),
        memberId: member.id,
        expiresAt
      }
    });

    setSessionCookie(token, expiresAt);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
