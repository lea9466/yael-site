"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "admin-sidebar-collapsed";
const WIDTH_EXPANDED = "280px";
const WIDTH_COLLAPSED = "80px";

function readCollapsedFromStorage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

function applySidebarWidth(collapsed: boolean) {
  document.documentElement.style.setProperty(
    "--sidebar-width",
    collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED
  );
  document.documentElement.dataset.sidebarCollapsed = collapsed ? "true" : "false";
}

export function useSidebarCollapse() {
  const [collapsed, setCollapsed] = useState(() => readCollapsedFromStorage());

  useEffect(() => {
    applySidebarWidth(collapsed);
  }, [collapsed]);

  const toggle = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return { collapsed, toggle, isReady: true };
}
