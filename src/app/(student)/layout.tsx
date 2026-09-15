import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import StudentSidebar from "@/components/StudentSidebar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth("student");

  const streak = await prisma.streak.findUnique({
    where: { userId: session.userId },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentSidebar
        studentName={session.name || "Student"}
        streak={streak?.currentStreak ?? 0}
      />
      <main className="ml-64 p-6 lg:p-8">{children}</main>
    </div>
  );
}
