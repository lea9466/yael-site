import "server-only";

import {
  buildMailtoHref,
  buildTelHref,
  buildWhatsAppHref,
  formatContactMessageDate,
} from "@/lib/contact-messages/format";
import { escapeHtml } from "@/lib/services/sanitize";

import type { ContactNotificationPayload } from "@/lib/contact/types";

const BRAND_GREEN = "#3F5F47";
const BRAND_BEIGE = "#E3C7A6";
const TEXT_MUTED = "#5C6B5E";
const SURFACE = "#FBF8F3";

function resolveSiteUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!raw) {
    return null;
  }

  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    return null;
  }
}

function buildAdminMessageUrl(messageId: string): string | null {
  const siteUrl = resolveSiteUrl();

  if (!siteUrl) {
    return null;
  }

  return `${siteUrl}/admin/contact-messages/${messageId}`;
}

function renderActionButton(label: string, href: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 14px;border-radius:8px;background:${BRAND_GREEN};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;text-align:center;">${escapeHtml(label)}</a>`;
}

export function buildContactNotificationSubject(
  fullName: string
): string {
  return `פנייה חדשה מהאתר – ${fullName.trim()}`;
}

export function buildContactNotificationText(
  payload: ContactNotificationPayload
): string {
  const receivedAt = formatContactMessageDate(payload.createdAt);
  const adminUrl = buildAdminMessageUrl(payload.messageId);
  const phoneLine = payload.phone?.trim() || "לא צוין";

  const lines = [
    "התקבלה פנייה חדשה מטופס יצירת הקשר באתר.",
    "",
    `שם: ${payload.fullName}`,
    `אימייל: ${payload.email}`,
    `טלפון: ${phoneLine}`,
    `התקבלה ב: ${receivedAt}`,
    "",
    "הודעה:",
    payload.message,
  ];

  if (adminUrl) {
    lines.push("", `צפייה באדמין: ${adminUrl}`);
  }

  return lines.join("\n");
}

export function buildContactNotificationHtml(
  payload: ContactNotificationPayload
): string {
  const receivedAt = formatContactMessageDate(payload.createdAt);
  const adminUrl = buildAdminMessageUrl(payload.messageId);
  const phone = payload.phone?.trim() || null;
  const mailtoHref = buildMailtoHref(payload.email);
  const telHref = phone ? buildTelHref(phone) : null;
  const whatsappHref = phone ? buildWhatsAppHref(phone) : null;
  const safeMessage = escapeHtml(payload.message).replaceAll("\n", "<br />");

  const actions = [
    renderActionButton("שליחת אימייל", mailtoHref),
    telHref ? renderActionButton("התקשר", telHref) : "",
    whatsappHref ? renderActionButton("WhatsApp", whatsappHref) : "",
    adminUrl ? renderActionButton("צפייה באדמין", adminUrl) : "",
  ]
    .filter(Boolean)
    .join("");

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
                <h1 style="margin:8px 0 0;font-size:22px;line-height:1.35;font-weight:700;text-align:right;">פנייה חדשה מהאתר</h1>
              </td>
            </tr>
            <tr>
              <td align="right" dir="rtl" style="padding:24px;direction:rtl;text-align:right;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${TEXT_MUTED};text-align:right;">
                  התקבלה פנייה חדשה מטופס יצירת הקשר.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="rtl" style="font-size:15px;line-height:1.7;direction:rtl;text-align:right;">
                  <tr>
                    <td align="right" dir="rtl" style="padding:6px 0 6px 12px;color:${TEXT_MUTED};width:96px;text-align:right;white-space:nowrap;">שם</td>
                    <td align="right" dir="rtl" style="padding:6px 0;font-weight:600;text-align:right;">${escapeHtml(payload.fullName)}</td>
                  </tr>
                  <tr>
                    <td align="right" dir="rtl" style="padding:6px 0 6px 12px;color:${TEXT_MUTED};text-align:right;white-space:nowrap;">אימייל</td>
                    <td align="right" style="padding:6px 0;text-align:right;">
                      <a href="${escapeHtml(mailtoHref)}" dir="ltr" style="color:${BRAND_GREEN};text-decoration:underline;unicode-bidi:isolate;">${escapeHtml(payload.email)}</a>
                    </td>
                  </tr>
                  <tr>
                    <td align="right" dir="rtl" style="padding:6px 0 6px 12px;color:${TEXT_MUTED};text-align:right;white-space:nowrap;">טלפון</td>
                    <td align="right" style="padding:6px 0;text-align:right;">${phone ? `<span dir="ltr" style="unicode-bidi:isolate;">${escapeHtml(phone)}</span>` : "לא צוין"}</td>
                  </tr>
                  <tr>
                    <td align="right" dir="rtl" style="padding:6px 0 6px 12px;color:${TEXT_MUTED};text-align:right;white-space:nowrap;">התקבלה ב</td>
                    <td align="right" dir="rtl" style="padding:6px 0;text-align:right;">${escapeHtml(receivedAt)}</td>
                  </tr>
                </table>
                <div style="margin:20px 0 8px;font-size:14px;font-weight:700;color:${BRAND_GREEN};text-align:right;">הודעה</div>
                <div dir="rtl" style="padding:14px 16px;border-radius:10px;background:${SURFACE};border:1px solid ${BRAND_BEIGE};font-size:15px;line-height:1.7;direction:rtl;text-align:right;">
                  ${safeMessage}
                </div>
                <div dir="rtl" style="margin-top:22px;direction:rtl;text-align:right;">
                  ${actions}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
