export const ADMIN_INACTIVITY_MS = 15 * 60 * 1000;

export const ADMIN_LAST_ACTIVITY_COOKIE = "admin_last_activity";

export const adminActivityCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
