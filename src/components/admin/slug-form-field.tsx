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
  onChange: (value: string) => void;
  onManualEdit: () => void;
  onResetFromTitle: () => void;
};

export function SlugFormField({
  label,
  htmlFor,
  value,
  hint = "נוצר אוטומטית מהכותרת. ניתן לעריכה ידנית.",
  error,
  required = true,
  onChange,
  onManualEdit,
  onResetFromTitle,
}: SlugFormFieldProps) {
  return (
    <FormField
      label={label}
      htmlFor={htmlFor}
      required={required}
      hint={hint}
      error={error}
    >
      <div className="space-y-2">
        <Input
          id={htmlFor}
          value={value}
          dir="auto"
          error={Boolean(error)}
          onChange={(event) => {
            onManualEdit();
            onChange(event.target.value);
          }}
        />
        <Button type="button" variant="ghost" size="sm" onClick={onResetFromTitle}>
          איפוס לפי הכותרת
        </Button>
      </div>
    </FormField>
  );
}
