"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function writeStored(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode / quota); the UI just won't persist.
  }
  listeners.forEach((listener) => listener());
}

/** Reads and writes a JSON value in localStorage, shared across components and tabs. */
export function useStored<T>(key: string, initial: T): [T, (next: T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );
  const value = useMemo<T>(() => {
    if (raw === null) return initial;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);
  const set = useCallback((next: T) => writeStored(key, next), [key]);

  return [value, set];
}

export type BookingDraft = {
  specialist: string;
  date: string;
  time: string;
  product?: string;
};

export type SavedBooking = {
  id: string;
  branch: string;
  product: string;
  specialist: string;
  date: string;
  time: string;
};

export const DRAFT_KEY = "joud-booking-draft";
export const BOOKINGS_KEY = "joud-bookings";
export const BRANCH_KEY = "joud-branch";
