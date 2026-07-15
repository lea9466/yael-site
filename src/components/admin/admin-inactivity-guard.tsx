"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { logoutAction } from "@/actions/auth";
import { ADMIN_INACTIVITY_MS } from "@/lib/auth/constants";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

export function AdminInactivityGuard() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        void (async () => {
          const result = await logoutAction();

          if (result.success) {
            router.replace("/login?reason=inactivity");
            router.refresh();
          }
        })();
      }, ADMIN_INACTIVITY_MS);
    };

    resetTimer();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [router]);

  return null;
}
