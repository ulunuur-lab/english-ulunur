import { requireAuth } from "@/lib/auth";
import TeacherSidebar from "@/components/TeacherSidebar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("teacher");

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherSidebar />
      <main className="ml-64 p-6 lg:p-8">{children}</main>
    </div>
  );
}
