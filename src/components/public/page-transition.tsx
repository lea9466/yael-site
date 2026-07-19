"use client";

type PublicPageTransitionProps = {
  children: React.ReactNode;
};

export function PublicPageTransition({ children }: PublicPageTransitionProps) {
  return <div className="public-page-enter min-h-full">{children}</div>;
}
