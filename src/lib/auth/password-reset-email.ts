import "server-only";

import { Resend } from "resend";

import { escapeHtml } from "@/lib/services/sanitize";
import { SITE_ORIGIN } from "@/lib/site/constants";

const BRAND_GREEN = "#3F5F47";
const BRAND_BEIGE = "#E3C7A6";
const TEXT_MUTED = "#5C6B5E";
const SURFACE = "#FBF8F3";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      // Fall through to the production origin.
    }
  }

  return SITE_ORIGIN;
}

function resolveFromAddress(): string | null {
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || null;

  if (!fromEmail) {
    return null;
  }

  if (fromEmail.includes("<")) {
    return fromEmail;
  }

  return `Yaelifestyle <${fromEmail}>`;
}

export function buildPasswordResetUrl(tokenHash: string): string {
  const url = new URL("/login/reset-password", resolveSiteUrl());
  url.searchParams.set("token_hash", tokenHash);
  return url.toString();
}

function buildText(resetUrl: string): string {
  return [
    "התקבלה בקשה לאיפוס הסיסמה למערכת הניהול של האתר.",
    "",
    `לבחירת סיסמה חדשה: ${resetUrl}`,
    "",
    "הקישור תקף לזמן מוגבל ולשימוש אחד בלבד.",
    "אם לא את ביקשת את האיפוס, אפשר להתעלם מהמייל הזה — הסיסמה הנוכחית נשארת כמו שהיא.",
  ].join("\n");
}

function buildHtml(resetUrl: string): string {
  const safeUrl = escapeHtml(resetUrl);

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
  <body dir="rtl" style="margin:0;padding:0;background:${SURFACE};font-family:Arial,Helvetica,sans-serif;color:${BRAND_GREEN};direction:rtl;text-align:right;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="rtl" style="background:${SURFACE};padding:24px 12px;direction:rtl;text-align:right;">
      <tr>
        <td align="center" dir="rtl" style="direction:rtl;text-align:right;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="rtl" style="max-width:560px;background:#ffffff;border:1px solid ${BRAND_BEIGE};border-radius:12px;overflow:hidden;direction:rtl;text-align:right;">
            <tr>
              <td align="right" dir="rtl" style="padding:20px 24px;background:${BRAND_GREEN};color:#ffffff;direction:rtl;text-align:right;">
                <div style="font-size:12px;letter-spacing:0.04em;opacity:0.9;text-align:right;">Yaelifestyle</div>
                <h1 style="margin:8px 0 0;font-size:22px;line-height:1.35;font-weight:700;text-align:right;">איפוס סיסמה למערכת הניהול</h1>
              </td>
            </tr>
            <tr>
              <td align="right" dir="rtl" style="padding:24px;direction:rtl;text-align:right;">
                <p style="margin:0 0 20px;font-size:15px;line-height:1.7;text-align:right;">
                  התקבלה בקשה לאיפוס הסיסמה. כדי לבחור סיסמה חדשה, לחצי על הכפתור:
                </p>
                <a href="${safeUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:${BRAND_GREEN};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">בחירת סיסמה חדשה</a>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:${TEXT_MUTED};text-align:right;">
                  הקישור תקף לזמן מוגבל ולשימוש אחד בלבד.<br />
                  אם לא את ביקשת את האיפוס, אפשר להתעלם מהמייל הזה — הסיסמה הנוכחית נשארת כמו שהיא.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Returns false when the email could not be sent (missing config or Resend error). */
export async function sendPasswordResetEmail(
  to: string,
  tokenHash: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim() || null;
  const from = resolveFromAddress();

  if (!apiKey || !from) {
    console.error("[auth] password reset email skipped: missing Resend config");
    return false;
  }

  const resetUrl = buildPasswordResetUrl(tokenHash);
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: "איפוס סיסמה למערכת הניהול",
    html: buildHtml(resetUrl),
    text: buildText(resetUrl),
  });

  if (error) {
    console.error("[auth] password reset email failed", {
      type: error.name || "ResendError",
    });
    return false;
  }

  return true;
}
