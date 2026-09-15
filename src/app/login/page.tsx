import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();

  if (session.isLoggedIn) {
    if (session.role === "teacher") {
      redirect("/teacher");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="w-full max-w-md px-4">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-2xl font-bold mb-4 shadow-lg shadow-indigo-200">
            UE
          </div>
          <h1 className="text-3xl font-bold gradient-text">
            Ulunur&apos;s English
          </h1>
          <p className="text-slate-500 mt-2">B1 → B2+ Intensive Course</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            Welcome back
          </h2>
          <LoginForm />
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Built with 💜 for intensive learning
        </p>
      </div>
    </div>
  );
}
