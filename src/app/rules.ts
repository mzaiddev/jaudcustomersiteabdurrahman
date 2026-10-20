import type { Entitlement, EntitlementState, Service, SpaPackage } from "./types";

/** Same values as the admin app's RULES (src/api/rules.ts). */
export const RULES = {
  currency: "SAR",
  slotHoldMinutes: 10,
  slotStepMinutes: 30,
  freeChangeWindowHours: 24,
  packageValidityMonths: 2,
  timezone: "Asia/Riyadh",
  maxDaysAhead: 60,
} as const;

const RIYADH_OFFSET_MINUTES = 180;

/** `+9665…` form used as the customer key. Accepts 05…, 5…, 9665…, +9665…, 00…. */
export function normalizePhone(input: string): string {
  let digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) digits = `+${digits.slice(2)}`;
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("966")) return `+${digits}`;
  if (digits.startsWith("05")) return `+966${digits.slice(1)}`;
  if (digits.startsWith("5")) return `+966${digits}`;
  return digits;
}

export function isValidPhone(phone: string): boolean {
  return /^\+(966|971|965|973|974|968)\d{7,9}$/.test(phone);
}

/** Western digits only, so Arabic-Indic digits typed in a phone field still validate. */
export function toWesternDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}

/** Wall-clock parts of an instant in Asia/Riyadh. */
export function riyadhParts(value: string | number | Date) {
  const time = new Date(value).getTime() + RIYADH_OFFSET_MINUTES * 60_000;
  const shifted = new Date(time);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
    weekday: shifted.getUTCDay(),
  };
}

export function riyadhToday(): string {
  return riyadhParts(Date.now()).date;
}

export function minutesToClock(minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}

export function clockToMinutes(clock: string): number {
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
}

/** ISO instant for a Riyadh wall-clock date + minutes-from-midnight. */
export function riyadhIso(date: string, minutes: number): string {
  return `${date}T${minutesToClock(minutes)}:00+03:00`;
}

export function addDays(date: string, amount: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + amount));
  const nextMonth = String(next.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(next.getUTCDate()).padStart(2, "0");
  return `${next.getUTCFullYear()}-${nextMonth}-${nextDay}`;
}

export function weekdayOf(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function addMonthsIso(from: string | number, months: number): string {
  const date = new Date(from);
  const target = new Date(date.getTime());
  target.setUTCMonth(target.getUTCMonth() + months);
  return target.toISOString();
}

export function sessionsLeft(entitlement: Entitlement): number {
  return entitlement.sessionsTotal - entitlement.sessionsUsed - entitlement.sessionsReserved;
}

/** Admin rule (rules.ts): unpaid → expired → used up → active. */
export function entitlementState(entitlement: Entitlement, now = Date.now()): EntitlementState {
  if (entitlement.paymentStatus === "unpaid" || entitlement.paymentStatus === "pending") {
    return "unpaid";
  }
  if (new Date(entitlement.expiresAt).getTime() < now) return "expired";
  if (sessionsLeft(entitlement) <= 0 && entitlement.sessionsReserved === 0) return "used_up";
  return "active";
}

export function isUsablePackage(entitlement: Entitlement, now = Date.now()): boolean {
  return sessionsLeft(entitlement) > 0 && new Date(entitlement.expiresAt).getTime() > now;
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;

  return 2 * earthKm * Math.asin(Math.sqrt(h));
}

/** Pulls `lat, lng` out of a pasted map link, like the admin wizard does. */
export function parseMapLink(link: string): { lat: number; lng: number } | null {
  const match = link.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
  if (!match) return null;
  return { lat: Number(match[1]), lng: Number(match[2]) };
}

export function guestsFor(product: Service | SpaPackage, requested: number): number {
  const base = "sessions" in product ? product.guests : 1;
  return Math.max(base, requested || base);
}

export type PriceBreakdown = {
  base: number;
  extraGuests: number;
  extraGuestCount: number;
  total: number;
};

/** Package: price + (guests − pkg.guests) × extraGuestPrice. */
export function priceFor(
  product: Service | SpaPackage,
  guests: number,
): PriceBreakdown {
  const extraGuestCount =
    "sessions" in product ? Math.max(0, guests - product.guests) : 0;
  const extraGuests = "sessions" in product ? extraGuestCount * product.extraGuestPrice : 0;

  return {
    base: product.price,
    extraGuests,
    extraGuestCount,
    total: product.price + extraGuests,
  };
}
