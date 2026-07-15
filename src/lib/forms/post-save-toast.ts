const STORAGE_KEY = "admin-form-success-toast";

export function setPostSaveToast(message: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, message);
}

export function consumePostSaveToast(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const message = window.sessionStorage.getItem(STORAGE_KEY);

  if (!message) {
    return null;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
  return message;
}
