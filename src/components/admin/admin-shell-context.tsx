"use client";

import { createContext, useContext } from "react";

type AdminShellContextValue = {
  openMobileMenu: () => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

type AdminShellProviderProps = {
  openMobileMenu: () => void;
  children: React.ReactNode;
};

export function AdminShellProvider({
  openMobileMenu,
  children,
}: AdminShellProviderProps) {
  return (
    <AdminShellContext.Provider value={{ openMobileMenu }}>
      {children}
    </AdminShellContext.Provider>
  );
}

export function useAdminShell(): AdminShellContextValue {
  const context = useContext(AdminShellContext);

  if (!context) {
    throw new Error("useAdminShell must be used within AdminShellProvider");
  }

  return context;
}
