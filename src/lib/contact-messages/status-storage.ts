"use client";

import {
  CONTACT_MESSAGE_STATUS_STORAGE_KEY,
  CONTACT_MESSAGE_STATUSES,
  type ContactMessageStatus,
} from "@/lib/contact-messages/constants";

type StoredStatusMap = Record<string, ContactMessageStatus>;

function isContactMessageStatus(value: string): value is ContactMessageStatus {
  return (CONTACT_MESSAGE_STATUSES as readonly string[]).includes(value);
}

function readStoredStatusMap(): StoredStatusMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(CONTACT_MESSAGE_STATUS_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const result: StoredStatusMap = {};

    for (const [id, status] of Object.entries(parsed)) {
      if (typeof status === "string" && isContactMessageStatus(status)) {
        result[id] = status;
      }
    }

    return result;
  } catch {
    return {};
  }
}

function writeStoredStatusMap(map: StoredStatusMap): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      CONTACT_MESSAGE_STATUS_STORAGE_KEY,
      JSON.stringify(map)
    );
  } catch {
    // Ignore storage failures in private browsing or quota limits.
  }
}

export function getStoredContactMessageStatus(
  id: string
): ContactMessageStatus | null {
  const map = readStoredStatusMap();
  return map[id] ?? null;
}

export function setStoredContactMessageStatus(
  id: string,
  status: ContactMessageStatus
): void {
  const map = readStoredStatusMap();

  if (status === "handled") {
    delete map[id];
  } else if (status === "in_progress") {
    map[id] = status;
  } else {
    delete map[id];
  }

  writeStoredStatusMap(map);
}

export function removeStoredContactMessageStatus(id: string): void {
  const map = readStoredStatusMap();

  if (!(id in map)) {
    return;
  }

  delete map[id];
  writeStoredStatusMap(map);
}

export function readStoredContactMessageStatusMap(): StoredStatusMap {
  return readStoredStatusMap();
}
