"use client";

import { useState } from "react";

import { FormToast } from "@/components/ui/form-toast";
import { consumePostSaveToast } from "@/lib/forms/post-save-toast";

export function PostSaveToastListener() {
  const [toast, setToast] = useState(() => {
    const message = consumePostSaveToast();

    return {
      open: Boolean(message),
      message: message ?? "",
    };
  });

  return (
    <FormToast
      open={toast.open}
      variant="success"
      message={toast.message}
      autoHideMs={4000}
      onClose={() => setToast({ open: false, message: "" })}
    />
  );
}
