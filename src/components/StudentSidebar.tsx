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
  LogOut,
  Flame,
  Map,
  Award,
} from "lucide-react";
import { logout } from "@/lib/auth";

const studentLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Quest Roadmap", icon: Map },
  { href: "/level-check", label: "Level Check", icon: Award },
  { href: "/lessons", label: "Lessons", icon: BookOpen },
  { href: "/homework", label: "Homework", icon: ClipboardList },
  { href: "/vocab", label: "Vocabulary", icon: Brain },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

interface StudentSidebarProps {
  studentName: string;
  streak?: number;
}

export default function StudentSidebar({
  studentName,
  streak = 0,
}: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-40">
      {/* Brand */}
      <div className="p-5 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200">
            UE
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm leading-tight">
              Ulunur&apos;s English
            </h1>
            <p className="text-xs text-slate-400">B1 → B2+ Intensive</p>
          </div>
        </Link>
      </div>

      {/* Student Info + Streak */}
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-sm font-medium text-slate-700">
          👋 Hi, {studentName}
        </p>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 rounded-lg animate-pulse-glow">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-600">
                {streak} day streak!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {studentLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <link.icon
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-indigo-600" : "text-slate-400"
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
