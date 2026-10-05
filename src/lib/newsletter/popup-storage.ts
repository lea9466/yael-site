const STORAGE_KEY = "yael-newsletter-popup-v1";
export const NEWSLETTER_DISMISS_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type StoredState = { dismissedAt?: number; subscribed?: boolean };

export function readNewsletterStoredState(): StoredState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed as StoredState;
  } catch {
    return {};
  }
}

export function writeNewsletterStoredState(state: StoredState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private-mode failures — popup just may reappear sooner.
  }
}

/** Marks this browser as subscribed, so the floating popup won't later
 * nag someone who already signed up through a different form (e.g. the
 * footer). */
export function markNewsletterSubscribed() {
  writeNewsletterStoredState({ subscribed: true });
}

export function shouldOfferNewsletterSignup(): boolean {
  const stored = readNewsletterStoredState();

  if (stored.subscribed) {
    return false;
  }

  if (
    stored.dismissedAt &&
    Date.now() - stored.dismissedAt < NEWSLETTER_DISMISS_SNOOZE_MS
  ) {
    return false;
  }

  return true;
}
