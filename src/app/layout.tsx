import type { Metadata, Viewport } from "next";

import { mainFont } from "@/lib/theme/fonts";
import { SITE_ORIGIN } from "@/lib/site/constants";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "יעל קנייבסקי | ליווי תזונתי ואכילה מקושרת",
    template: "%s | יעל קנייבסקי",
  },
  description: "ליווי תזונתי ואכילה מקושרת עם יעל קנייבסקי.",
};

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
    <html lang="he" dir="rtl" className={`${mainFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-primary">
        {children}
        <div id="portal-root" />
      </body>
    </html>
  );
}
