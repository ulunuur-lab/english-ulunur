import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LevelCheckClient from "./LevelCheckClient";

export default async function LevelCheckPage() {
  const session = await requireAuth("student");

  const lastCheck = await prisma.levelCheck.findFirst({
    where: { userId: session.userId },
    orderBy: { completedAt: "desc" },
  });

  return (
    <LevelCheckClient
      lastCheck={
        lastCheck
          ? {
              levelResult: lastCheck.levelResult,
              score: lastCheck.score,
              completedAt: lastCheck.completedAt,
              type: lastCheck.type,
            }
          : null
      }
      studentName={session.name}
    />
  );
}
