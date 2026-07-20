"use client";

import { ServiceAudienceIcon } from "@/components/services/service-audience-icon";
import {
  DEFAULT_SERVICE_AUDIENCE_ICON,
  normalizeServiceAudienceIcon,
  SERVICE_AUDIENCE_ICON_LABELS,
  SERVICE_AUDIENCE_ICON_NAMES,
} from "@/lib/services/audience-icons";
import { cn } from "@/lib/utils/cn";

type ServiceAudienceIconPickerProps = {
  id: string;
  label?: string;
  value: string;
  onChange: (icon: string) => void;
};

export function ServiceAudienceIconPicker({
  id,
  label = "אייקון",
  value,
  onChange,
}: ServiceAudienceIconPickerProps) {
  const selected =
    normalizeServiceAudienceIcon(value) ?? DEFAULT_SERVICE_AUDIENCE_ICON;

  return (
    <div className="space-y-2">
      <p
        id={`${id}-label`}
        className="block text-caption font-medium text-[var(--color-text-muted)]"
      >
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8"
      >
        {SERVICE_AUDIENCE_ICON_NAMES.map((iconName) => {
          const isSelected = selected === iconName;
          const hebrewLabel = SERVICE_AUDIENCE_ICON_LABELS[iconName];

          return (
            <button
              key={iconName}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={hebrewLabel}
              title={hebrewLabel}
              onClick={() => onChange(iconName)}
              className={cn(
                "admin-interactive flex size-11 items-center justify-center rounded-[var(--radius-md)] border text-[var(--color-primary)] transition-colors",
                isSelected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]/20"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-soft)]"
              )}
            >
              <ServiceAudienceIcon name={iconName} className="size-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
