"use client";

import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";

import {
  buildMailtoHref,
  buildTelHref,
  buildWhatsAppHref,
} from "@/lib/contact-messages/format";
import { cn } from "@/lib/utils/cn";

type ContactMessageQuickActionsProps = {
  email: string;
  phone: string | null;
  className?: string;
};

const actionClassName =
  "admin-interactive inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-cream)]/50 px-4 text-sm font-medium text-[var(--color-primary)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-light-sage-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]";

export function ContactMessageQuickActions({
  email,
  phone,
  className,
}: ContactMessageQuickActionsProps) {
  const mailtoHref = buildMailtoHref(email);
  const telHref = phone ? buildTelHref(phone) : null;
  const whatsappHref = phone ? buildWhatsAppHref(phone) : null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Link href={mailtoHref} className={actionClassName}>
        <Mail aria-hidden="true" className="size-4" />
        שליחת אימייל
      </Link>

      {telHref ? (
        <Link href={telHref} className={actionClassName}>
          <Phone aria-hidden="true" className="size-4" />
          התקשר
        </Link>
      ) : null}

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={actionClassName}
        >
          <MessageCircle aria-hidden="true" className="size-4" />
          WhatsApp
        </a>
      ) : null}
    </div>
  );
}
