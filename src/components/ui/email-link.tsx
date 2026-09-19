"use client";

import {
  buildGmailComposeHref,
  buildMailtoHref,
} from "@/lib/contact-messages/format";

type EmailLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  email: string;
};

// Phones and tablets have a mail app registered for mailto:, so the native
// handoff works there. Desktop browsers often have no handler, which made the
// link look dead — for those we open a Gmail compose window instead.
function isDesktopBrowser(): boolean {
  return (
    !window.matchMedia("(pointer: coarse)").matches &&
    !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  );
}

export function EmailLink({
  email,
  onClick,
  children,
  ...props
}: EmailLinkProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !isDesktopBrowser()
    ) {
      return;
    }

    event.preventDefault();
    window.open(buildGmailComposeHref(email), "_blank", "noopener,noreferrer");
  };

  return (
    <a href={buildMailtoHref(email)} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
