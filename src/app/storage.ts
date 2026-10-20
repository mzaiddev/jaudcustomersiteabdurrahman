"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

export function readStoredValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function subscribeStored(listener: () => void) {
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

export function removeStored(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
  listeners.forEach((listener) => listener());
}

/** Reads and writes a JSON value in localStorage, shared across components and tabs. */
export function useStored<T>(key: string, initial: T): [T, (next: T) => void] {
  const raw = useSyncExternalStore(
    subscribeStored,
    () => readStoredValue(key),
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

/** In-progress booking, kept per city and product so it survives the login redirect. */
export type BookingDraft = {
  addressId: string;
  guests: number;
  notes: string;
  specialist: string;
  date: string;
  time: string;
};

export const emptyDraft: BookingDraft = {
  addressId: "",
  guests: 0,
  notes: "",
  specialist: "any",
  date: "",
  time: "",
};

export function draftKey(branch: string, product: string, entitlementId?: string) {
  return `joud-draft-${branch}-${product}${entitlementId ? `-${entitlementId}` : ""}`;
}

export const BRANCH_KEY = "joud-branch";
