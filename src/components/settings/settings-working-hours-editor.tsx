"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { WEEKDAYS } from "@/lib/settings/constants";
import type { BusinessProfileData } from "@/lib/validations/site-settings";
import { cn } from "@/lib/utils/cn";

type WorkingHoursEntry = BusinessProfileData["working_hours"][number];

type SettingsWorkingHoursEditorProps = {
  value: WorkingHoursEntry[];
  onChange: (value: WorkingHoursEntry[]) => void;
  fieldErrors: Record<string, string>;
};

function getFieldError(
  fieldErrors: Record<string, string>,
  index: number,
  field: "day" | "opens" | "closes"
): string | undefined {
  return (
    fieldErrors[`working_hours.${index}.${field}`] ??
    fieldErrors[`working_hours.${index}`]
  );
}

export function SettingsWorkingHoursEditor({
  value,
  onChange,
  fieldErrors,
}: SettingsWorkingHoursEditorProps) {
  const handleAdd = () => {
    const usedDays = new Set(value.map((entry) => entry.day));
    const nextDay = WEEKDAYS.find((day) => !usedDays.has(day.value));

    if (!nextDay) {
      return;
    }

    onChange([
      ...value,
      {
        day: nextDay.value,
        opens: "09:00",
        closes: "17:00",
      },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, entryIndex) => entryIndex !== index));
  };

  const handleUpdate = (
    index: number,
    patch: Partial<WorkingHoursEntry>
  ) => {
    onChange(
      value.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--color-text)]">
            שעות פעילות
          </p>
          <p className="text-caption text-[var(--color-text-muted)]">
            הוסיפו ימים ושעות פעילות העסק
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={value.length >= WEEKDAYS.length}
          onClick={handleAdd}
        >
          <Plus aria-hidden="true" className="size-4" />
          הוספת יום
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-6 text-sm text-[var(--color-text-muted)]">
          לא הוגדרו שעות פעילות.
        </p>
      ) : (
        <ul className="space-y-3">
          {value.map((entry, index) => (
            <li
              key={`${entry.day}-${index}`}
              className="surface-card-elevated grid gap-4 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <FormField
                label="יום"
                htmlFor={`field-working-day-${index}`}
                error={getFieldError(fieldErrors, index, "day")}
              >
                <select
                  id={`field-working-day-${index}`}
                  value={entry.day}
                  className={cn(
                    "admin-interactive h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm text-[var(--color-text)]",
                    "focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/15",
                    getFieldError(fieldErrors, index, "day") &&
                      "border-[var(--color-error)]"
                  )}
                  onChange={(event) =>
                    handleUpdate(index, {
                      day: event.target.value as WorkingHoursEntry["day"],
                    })
                  }
                >
                  {WEEKDAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="פתיחה"
                htmlFor={`field-working-opens-${index}`}
                error={getFieldError(fieldErrors, index, "opens")}
              >
                <Input
                  id={`field-working-opens-${index}`}
                  type="time"
                  value={entry.opens}
                  dir="ltr"
                  error={Boolean(getFieldError(fieldErrors, index, "opens"))}
                  onChange={(event) =>
                    handleUpdate(index, { opens: event.target.value })
                  }
                />
              </FormField>

              <FormField
                label="סגירה"
                htmlFor={`field-working-closes-${index}`}
                error={getFieldError(fieldErrors, index, "closes")}
              >
                <Input
                  id={`field-working-closes-${index}`}
                  type="time"
                  value={entry.closes}
                  dir="ltr"
                  error={Boolean(getFieldError(fieldErrors, index, "closes"))}
                  onChange={(event) =>
                    handleUpdate(index, { closes: event.target.value })
                  }
                />
              </FormField>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`הסרת ${WEEKDAYS.find((day) => day.value === entry.day)?.label ?? "יום"}`}
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
