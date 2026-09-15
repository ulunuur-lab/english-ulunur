"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Brain,
  BarChart3,
  FolderOpen,
  MessageSquare,
  LogOut,
  GraduationCap,
  Map,
} from "lucide-react";
import { logout } from "@/lib/auth";

const teacherLinks = [
  { href: "/teacher", label: "Overview", icon: LayoutDashboard },
  { href: "/teacher/roadmap", label: "Roadmap Control", icon: Map },
  { href: "/teacher/lessons", label: "Lessons", icon: BookOpen },
  { href: "/teacher/homework", label: "Homework", icon: ClipboardList },
  { href: "/teacher/vocab", label: "Vocabulary", icon: Brain },
  { href: "/teacher/progress", label: "Progress", icon: BarChart3 },
  { href: "/teacher/resources", label: "Resources", icon: FolderOpen },
  { href: "/teacher/notes", label: "Notes", icon: MessageSquare },
];

export default function TeacherSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 flex flex-col z-40">
      {/* Brand */}
      <div className="p-5 border-b border-slate-700/50">
        <Link href="/teacher" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-lg">
            UE
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">
              Ulunur&apos;s English
            </h1>
            <p className="text-xs text-slate-400">Teacher Panel</p>
          </div>
        </Link>
      </div>

      {/* Teacher Info */}
      <div className="px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          <p className="text-sm font-medium text-slate-300">Teacher Mode</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {teacherLinks.map((link) => {
          const isActive =
            link.href === "/teacher"
              ? pathname === "/teacher"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-indigo-600/20 text-indigo-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <link.icon
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-indigo-400" : "text-slate-500"
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700/50">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
