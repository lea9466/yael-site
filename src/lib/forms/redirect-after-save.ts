import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { setPostSaveToast } from "@/lib/forms/post-save-toast";

export function redirectAfterSave(
  router: AppRouterInstance,
  listPath: string,
  message: string
) {
  setPostSaveToast(message);
  router.push(listPath);
  router.refresh();
}
