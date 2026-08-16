import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { editorialDisplayFont, mainFont } from "@/lib/theme/fonts";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildDefaultSiteMetadata } from "@/lib/seo/metadata";
import { SITE_ORIGIN } from "@/lib/site/constants";

import "./globals.css";
import "@/components/homepage/hero-section.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();
  const siteMetadata = buildDefaultSiteMetadata(settings);

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: {
      default: "יעל קנייבסקי | מאמנת אישית לאכילה מחוברת",
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

// Some browser filtering/extension software (e.g. NetFree blocking a video)
// injects its own elements directly into the page DOM. When React later
// tries to update that same region it calls removeChild/insertBefore on a
// node that's no longer where React expects, which throws and crashes the
// whole app. This makes those two DOM calls no-ops instead of throwing when
// the node isn't actually where React thinks it is.
const DOM_MUTATION_GUARD_SCRIPT = `(function () {
  if (typeof Node !== "function" || !Node.prototype) return;

  var originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  var originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
})();`;

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
        <Script id="dom-mutation-guard" strategy="beforeInteractive">
          {DOM_MUTATION_GUARD_SCRIPT}
        </Script>
        {children}
        <div id="portal-root" />
      </body>
    </html>
  );
}
