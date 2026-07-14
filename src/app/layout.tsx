import type { Metadata } from "next";

import { mainFont } from "@/lib/theme/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "יעל כנייבסקי | ליווי תזונתי ואכילה מקושרת",
  description: "ליווי תזונתי ואכילה מקושרת עם יעל כנייבסקי.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${mainFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-primary">{children}</body>
    </html>
  );
}
