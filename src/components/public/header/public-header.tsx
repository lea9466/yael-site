"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PublicNav } from "@/components/public/header/public-nav";
import { PublicLogo } from "@/components/public/header/public-logo";
import { Container } from "@/components/public/layout/container";
import {
  PUBLIC_CTA,
  PUBLIC_PRIMARY_NAV,
  type PublicNavLink,
} from "@/constants/public-navigation";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";
import { useScrolledHeader } from "@/lib/hooks/use-scrolled-header";
import type { WebsiteSettingsPublic } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  links: PublicNavLink[];
};

function MobileMenu({ open, onClose, links }: MobileMenuProps) {
  const menuRef = useFocusTrap<HTMLDivElement>({
    active: open,
    onEscape: onClose,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] lg:hidden" role="presentation">
      <button
        type="button"
        aria-label="סגירת תפריט"
        className="absolute inset-0 bg-[var(--color-text)]/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={menuRef}
        id="public-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="תפריט ניווט"
        className="absolute inset-y-0 start-0 flex w-[min(88vw,20rem)] flex-col bg-[var(--color-surface)] shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-4">
          <p className="text-sm font-semibold text-[var(--color-primary)]">תפריט</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירת תפריט"
            className="public-focus-ring inline-flex size-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-primary)] hover:bg-[var(--color-surface-soft)]"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <PublicNav links={links} onNavigate={onClose} />
        </div>
        <div className="border-t border-[var(--color-border)] p-4">
          <Link
            href={PUBLIC_CTA.href}
            onClick={onClose}
            className="public-focus-ring flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-[image:var(--gradient-warm)] text-sm font-medium text-[var(--color-text-on-primary)] shadow-[var(--shadow-sm)]"
          >
            {PUBLIC_CTA.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

type PublicHeaderProps = {
  settings: WebsiteSettingsPublic;
};

export function PublicHeader({ settings }: PublicHeaderProps) {
  const isScrolled = useScrolledHeader();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  return (
    <>
      <header
        className={cn(
          "public-header fixed inset-x-0 top-0 z-[var(--z-sticky)] transition-[background-color,box-shadow,border-color] duration-[var(--transition-base)]",
          isScrolled
            ? "public-header--scrolled border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 shadow-[var(--shadow-sm)] backdrop-blur-md"
            : "public-header--transparent border-b border-transparent bg-transparent"
        )}
      >
        <Container className="grid h-[var(--public-header-height)] max-w-[1700px] grid-cols-[1fr_auto] items-center gap-4 px-5 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-10 lg:px-12 xl:px-16">
          <div className="justify-self-start">
            <PublicLogo settings={settings} priority />
          </div>

          <div className="hidden justify-self-center lg:block">
            <PublicNav links={PUBLIC_PRIMARY_NAV} />
          </div>

          <div className="hidden justify-self-end lg:block">
            <Link
              href={PUBLIC_CTA.href}
              className="public-focus-ring inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[image:var(--gradient-warm)] px-4 text-sm font-medium text-[var(--color-text-on-primary)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              {PUBLIC_CTA.label}
            </Link>
          </div>

          <button
            type="button"
            className="public-focus-ring inline-flex size-11 items-center justify-center justify-self-end rounded-[var(--radius-md)] text-[var(--color-primary)] hover:bg-[var(--color-surface-soft)] lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
            aria-label={menuOpen ? "סגירת תפריט" : "פתיחת תפריט"}
            onClick={menuOpen ? closeMenu : openMenu}
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
        </Container>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} links={PUBLIC_PRIMARY_NAV} />
    </>
  );
}
