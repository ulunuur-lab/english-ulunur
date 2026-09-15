import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ulunur's English | B1→B2+ Intensive",
  description:
    "Personalized English learning platform — from B1 to B2+ with structured lessons, vocabulary, and progress tracking.",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ulunur's English",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
