import { SessionOptions } from "iron-session";

export interface SessionData {
  userId: number;
  name: string;
  email: string;
  role: "teacher" | "student";
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  userId: 0,
  name: "",
  email: "",
  role: "student",
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "ulunurs-english-super-secret-key-that-is-at-least-32-chars-long!",
  cookieName: "ulunurs-english-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
