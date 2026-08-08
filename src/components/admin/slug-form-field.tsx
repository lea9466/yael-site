"use client";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

type SlugFormFieldProps = {
  label: string;
  htmlFor: string;
  value: string;
  hint?: string;
  error?: string;
  required?: boolean;
  locked?: boolean;
  onChange: (value: string) => void;
  onManualEdit: () => void;
  onResetFromTitle: () => void;
};

export function SlugFormField({
  label,
  htmlFor,
  value,
  hint,
  error,
  required = true,
  locked = false,
  onChange,
  onManualEdit,
  onResetFromTitle,
}: SlugFormFieldProps) {
  const resolvedHint =
    hint ??
    (locked
      ? "לא ניתן לשנות את הכתובת לאחר השמירה הראשונה."
      : "נוצר אוטומטית מהכותרת. ניתן לעריכה ידנית לפני השמירה הראשונה.");

  return (
    <FormField
      label={label}
      htmlFor={htmlFor}
      required={required && !locked}
      hint={resolvedHint}
      error={error}
    >
      <div className="space-y-2">
        <Input
          id={htmlFor}
          value={value}
          dir="auto"
          disabled={locked}
          readOnly={locked}
          error={Boolean(error)}
          onChange={(event) => {
            if (locked) {
              return;
            }

            onManualEdit();
            onChange(event.target.value);
          }}
        />
        {!locked ? (
          <Button type="button" variant="ghost" size="sm" onClick={onResetFromTitle}>
            איפוס לפי הכותרת
          </Button>
        ) : null}
      </div>
    </FormField>
  );
}
