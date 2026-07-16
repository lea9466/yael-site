"use client";

import { cn } from "@/lib/utils/cn";
import { SETTINGS_TABS, type SettingsTabId } from "@/lib/settings/constants";

type SettingsTabsProps = {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
};

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <nav
      aria-label="קטגוריות הגדרות"
      className="shrink-0 lg:w-56"
    >
      {/* Mobile / tablet: horizontal scroll */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 lg:hidden"
        role="tablist"
        aria-orientation="horizontal"
      >
        {SETTINGS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`settings-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`settings-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className={cn(
                "admin-interactive shrink-0 rounded-[var(--radius-full)] px-4 py-2.5 text-sm font-medium whitespace-nowrap",
                isActive
                  ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-[var(--shadow-sm)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] hover:text-[var(--color-text)]"
              )}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Desktop: vertical tabs on the right (inline-end in RTL) */}
      <ul
        className="hidden space-y-1 lg:block"
        role="tablist"
        aria-orientation="vertical"
      >
        {SETTINGS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <li key={tab.id}>
              <button
                type="button"
                role="tab"
                id={`settings-tab-${tab.id}-desktop`}
                aria-selected={isActive}
                aria-controls={`settings-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={cn(
                  "admin-interactive w-full rounded-[var(--radius-md)] px-4 py-3 text-start text-sm font-medium",
                  isActive
                    ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-[var(--shadow-sm)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]"
                )}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(event) => {
                  const currentIndex = SETTINGS_TABS.findIndex(
                    (entry) => entry.id === tab.id
                  );

                  if (event.key === "ArrowUp" && currentIndex > 0) {
                    event.preventDefault();
                    onTabChange(SETTINGS_TABS[currentIndex - 1].id);
                  }

                  if (
                    event.key === "ArrowDown" &&
                    currentIndex < SETTINGS_TABS.length - 1
                  ) {
                    event.preventDefault();
                    onTabChange(SETTINGS_TABS[currentIndex + 1].id);
                  }
                }}
              >
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
