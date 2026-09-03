export const ADMIN_LAST_ACTIVITY_COOKIE = "admin_last_activity";

export const adminActivityCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
