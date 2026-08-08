import type { Metadata, Viewport } from "next";

import { editorialDisplayFont, mainFont } from "@/lib/theme/fonts";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildDefaultSiteMetadata } from "@/lib/seo/metadata";
import { SITE_ORIGIN } from "@/lib/site/constants";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();
  const siteMetadata = buildDefaultSiteMetadata(settings);

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: {
      default: "יעל קנייבסקי | מאמנת לאכילה מחוברת וליווי תזונתי",
      template: "%s | יעל קנייבסקי",
    },
    description:
      "מאמנת לאכילה מחוברת — ליווי אישי, סדנאות תזונה בריאה, מתכונים בריאים ומאמרים על תזונה עם יעל קנייבסקי.",
    icons: siteMetadata.icons,
  };
}

export const viewport: Viewport = {
  themeColor: "#3f5f47",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${mainFont.variable} ${editorialDisplayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-primary">
        {children}
        <div id="portal-root" />
      </body>
    </html>
  );
}
