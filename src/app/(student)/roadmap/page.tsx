import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import RoadmapView from "./RoadmapView";

export default async function RoadmapPage() {
  const session = await requireAuth("student");

  // Fetch all roadmap topics
  const topics = await prisma.roadmapTopic.findMany({
    orderBy: { orderIndex: "asc" },
  });

  // Fetch student progress for these topics
  const progressList = await prisma.userTopicProgress.findMany({
    where: { userId: session.userId },
  });

  const progressMap = new Map<number, { status: "locked" | "unlocked" | "completed"; score: number | null }>();
  progressList.forEach((p) => {
    progressMap.set(p.topicId, {
      status: p.status as "locked" | "unlocked" | "completed",
      score: p.score,
    });
  });

  // Combine topics with progress
  const formattedTopics = topics.map((t, idx) => {
    const p = progressMap.get(t.id);
    // Topic #1 is unlocked by default if not set
    const defaultStatus = idx === 0 ? "unlocked" : "locked";

    return {
      id: t.id,
      world: t.world,
      orderIndex: t.orderIndex,
      title: t.title,
      description: t.description,
      skill: t.skill,
      isBoss: t.isBoss,
      quizData: t.quizData,
      status: (p?.status || defaultStatus) as "locked" | "unlocked" | "completed",
      score: p?.score ?? null,
    };
  });

  return <RoadmapView topics={formattedTopics} studentName={session.name} />;
}
