"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { useClientReady } from "@/lib/hooks/use-client-ready";
import { getPortalRoot } from "@/lib/portal/get-portal-root";

type DropdownLayer = "page" | "modal";

type DropdownMenuProps = {
  trigger: React.ReactNode;
  triggerLabel: string;
  children: React.ReactNode;
  align?: "end" | "start";
  layer?: DropdownLayer;
  className?: string;
};

type MenuPosition = {
  top: number;
  left: number;
  maxHeight: number;
};

const LAYER_Z_INDEX: Record<DropdownLayer, number> = {
  page: 40,
  modal: 10000,
};

function getMenuWidth(menuElement: HTMLElement | null): number {
  return menuElement?.offsetWidth ?? 176;
}

function computeMenuPosition(
  triggerRect: DOMRect,
  menuWidth: number,
  menuHeight: number,
  align: "end" | "start"
): MenuPosition {
  const padding = 8;
  const gap = 4;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isRtl = document.documentElement.dir === "rtl";

  const spaceBelow = viewportHeight - triggerRect.bottom - padding;
  const spaceAbove = triggerRect.top - padding;
  const openUpward =
    spaceBelow < Math.min(menuHeight, 240) + gap && spaceAbove > spaceBelow;

  const availableHeight = openUpward ? spaceAbove : spaceBelow;
  const maxHeight = Math.max(120, availableHeight - gap);

  let left =
    align === "end"
      ? isRtl
        ? triggerRect.left
        : triggerRect.right - menuWidth
      : isRtl
        ? triggerRect.right - menuWidth
        : triggerRect.left;

  left = Math.max(
    padding,
    Math.min(left, viewportWidth - menuWidth - padding)
  );

  const top = openUpward
    ? Math.max(padding, triggerRect.top - Math.min(menuHeight, maxHeight) - gap)
    : Math.min(
        triggerRect.bottom + gap,
        viewportHeight - Math.min(menuHeight, maxHeight) - padding
      );

  return { top, left, maxHeight };
}

function getMenuItems(menuElement: HTMLElement | null): HTMLElement[] {
  if (!menuElement) {
    return [];
  }

  return Array.from(
    menuElement.querySelectorAll<HTMLElement>('[role="menuitem"]')
  );
}

export function DropdownMenu({
  trigger,
  triggerLabel,
  children,
  align = "end",
  layer = "page",
  className,
}: DropdownMenuProps) {
  const menuId = useId();
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const isClientReady = useClientReady();
  const [previousPathname, setPreviousPathname] = useState(pathname);

  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    if (open) {
      setOpen(false);
    }
  }

  const updatePosition = useCallback(() => {
    const triggerElement = triggerRef.current;
    const menuElement = menuRef.current;

    if (!triggerElement || !menuElement) {
      return;
    }

    const triggerRect = triggerElement.getBoundingClientRect();
    const menuWidth = getMenuWidth(menuElement);
    const menuHeight = menuElement.offsetHeight;

    setPosition(
      computeMenuPosition(triggerRect, menuWidth, menuHeight, align)
    );
  }, [align]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      updatePosition();
    });

    const handleScroll = () => {
      updatePosition();
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, updatePosition, children]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const items = getMenuItems(menuRef.current);
      items[0]?.focus();
    });

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (!menuRef.current?.contains(event.target as Node)) {
        return;
      }

      const currentItems = getMenuItems(menuRef.current);
      const currentIndex = currentItems.findIndex(
        (item) => item === document.activeElement
      );

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex =
          currentIndex < currentItems.length - 1 ? currentIndex + 1 : 0;
        currentItems[nextIndex]?.focus();
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const previousIndex =
          currentIndex > 0 ? currentIndex - 1 : currentItems.length - 1;
        currentItems[previousIndex]?.focus();
      }

      if (event.key === "Home") {
        event.preventDefault();
        currentItems[0]?.focus();
      }

      if (event.key === "End") {
        event.preventDefault();
        currentItems[currentItems.length - 1]?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen((current) => !current);
  };

  const handleClose = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const menu =
    open && isClientReady
      ? createPortal(
          <ul
            ref={menuRef}
            id={menuId}
            role="menu"
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              maxHeight: position?.maxHeight,
              visibility: position ? "visible" : "hidden",
              zIndex: LAYER_Z_INDEX[layer],
            }}
            className={cn(
              "fixed min-w-44 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-md)]",
              className
            )}
            onClick={(event) => {
              const target = event.target as HTMLElement;

              if (target.closest('[role="menuitem"]')) {
                handleClose();
              }
            }}
          >
            {children}
          </ul>,
          getPortalRoot()
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        title={triggerLabel}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-primary)] transition-colors hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleToggle}
      >
        {trigger}
      </button>
      {menu}
    </>
  );
}

export function DropdownMenuItem({
  children,
  onSelect,
  destructive = false,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  destructive?: boolean;
}) {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-sm",
          destructive
            ? "text-[var(--color-error)] hover:bg-[var(--color-error-soft)]"
            : "hover:bg-[var(--color-surface-soft)]"
        )}
        onClick={onSelect}
      >
        {children}
      </button>
    </li>
  );
}
