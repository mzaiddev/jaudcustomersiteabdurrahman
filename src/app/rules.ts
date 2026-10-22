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
  /** A reminder is sent when a visit is closer than this, while it can still be rescheduled online. */
  reminderWindowHours: 48,
} as const;

/** True while a confirmed visit is 24–48 hours away: time for the "reschedule before it closes" reminder. */
export function inReminderWindow(booking: { status: string; startsAt: string }, now: number): boolean {
  const hours = (new Date(booking.startsAt).getTime() - now) / 3_600_000;
  return booking.status === "confirmed" && hours > RULES.freeChangeWindowHours && hours <= RULES.reminderWindowHours;
}

/** Optional extras. Names live in journeyCopy.addOns (same order). Price is per person, per visit. */
export const ADD_ON_PRICE = 35;
export const ADD_ONS = [
  { id: "head", minutes: 20 },
  { id: "guasha", minutes: 20 },
  { id: "birthday", minutes: 0 },
] as const;
export type AddOnId = (typeof ADD_ONS)[number]["id"];

/** An add-on bought for some number of visits and people (a service is always 1 × 1). */
export type AddOnLine = { id: AddOnId; visits: number; people: number };
/** An add-on applied to one visit. */
export type VisitAddOn = { id: AddOnId; people: number; source: "paid" | "package" };

function isAddOnId(id: unknown): id is AddOnId {
  return ADD_ONS.some((item) => item.id === id);
}

function clamp(value: unknown, min: number, max: number) {
  const number = Math.round(Number(value));
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min;
}

/** Keeps known add-ons once each, with visits/people inside the product's limits. */
export function cleanAddOnLines(lines: unknown, maxVisits: number, maxPeople: number): AddOnLine[] {
  if (!Array.isArray(lines)) return [];
  const seen = new Set<string>();
  return lines.flatMap((line) => {
    const id = (line as { id?: unknown })?.id;
    if (!isAddOnId(id) || seen.has(id)) return [];
    seen.add(id);
    const { visits, people } = line as { visits?: unknown; people?: unknown };
    return [{ id, visits: clamp(visits, 1, Math.max(1, maxVisits)), people: clamp(people, 1, Math.max(1, maxPeople)) }];
  });
}

export function addOnCost(lines: ReadonlyArray<{ visits?: number; people: number }>): number {
  return lines.reduce((sum, line) => sum + ADD_ON_PRICE * (line.visits ?? 1) * line.people, 0);
}

/** Extra minutes a visit takes: each massage add-on adds its time for every person who gets it. */
export function visitAddOnMinutes(addOns: ReadonlyArray<{ id: string; people: number }> | undefined): number {
  return (addOns ?? []).reduce(
    (sum, line) => sum + (ADD_ONS.find((item) => item.id === line.id)?.minutes ?? 0) * line.people,
    0,
  );
}

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

const MAP_LINK_PATTERNS = [
  // Place links: the pin is the !3d…!4d… part (the @… part is only where the map was centred).
  /!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/,
  // ?q=24.7,46.7  ?query=…  ?ll=…  ?destination=…
  /[?&](?:q|query|ll|destination|daddr|center|sll)=\+?(-?\d{1,2}\.\d+)[,+ ]+(-?\d{1,3}\.\d+)/,
  // …/@24.7136,46.6753,15z
  /@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/,
  // Plain "24.7136, 46.6753"
  /(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/,
];

/** Pulls the point out of a pasted Google Maps link or plain "lat, lng" text. */
export function parseMapLink(link: string): { lat: number; lng: number } | null {
  let text = link.trim();
  try {
    text = decodeURIComponent(text);
  } catch {
    // Keep the raw text when it has a stray "%".
  }
  for (const pattern of MAP_LINK_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  }
  return null;
}

/** Google's short share links (maps.app.goo.gl/…) hide the point, so they have to be opened to read it. */
export function isShortMapLink(link: string): boolean {
  return /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(link.trim());
}

export function guestsFor(product: Service | SpaPackage, requested: number): number {
  const base = "sessions" in product ? product.guests : 1;
  return Math.max(base, requested || base);
}

export type PriceBreakdown = {
  base: number;
  extraGuests: number;
  extraGuestCount: number;
  addOns: number;
  total: number;
};

/** Price + (guests − pkg.guests) × extraGuestPrice + add-ons (35 × visits × people per line). */
export function priceFor(
  product: Service | SpaPackage,
  guests: number,
  addOnLines: ReadonlyArray<{ visits?: number; people: number }> = [],
): PriceBreakdown {
  const extraGuestCount =
    "sessions" in product ? Math.max(0, guests - product.guests) : 0;
  const extraGuests = "sessions" in product ? extraGuestCount * product.extraGuestPrice : 0;

  const addOns = addOnCost(addOnLines);

  return {
    base: product.price,
    extraGuests,
    extraGuestCount,
    addOns,
    total: product.price + extraGuests + addOns,
  };
}
