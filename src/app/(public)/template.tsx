import { PublicPageTransition } from "@/components/public/page-transition";

export default function PublicTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PublicPageTransition>{children}</PublicPageTransition>;
}
