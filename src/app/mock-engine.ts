"use client";

import { useSyncExternalStore } from "react";
import { findLocation, findPackage, findService, specialists } from "./mock-data";
import {
  RULES,
  addMonthsIso,
  clockToMinutes,
  distanceKm,
  entitlementState,
  guestsFor,
  isValidPhone,
  isUsablePackage,
  normalizePhone,
  priceFor,
  riyadhIso,
  riyadhParts,
  riyadhToday,
  addDays,
  addOnCost,
  inReminderWindow,
  cleanAddOnLines,
  visitAddOnMinutes,
  weekdayOf,
  type AddOnLine,
  type VisitAddOn,
} from "./rules";
import { readStoredValue, subscribeStored, writeStored } from "./storage";
import {
  EngineError,
  type AddOnCredit,
  type AppNotification,
  type Address,
  type Booking,
  type Customer,
  type Db,
  type Entitlement,
  type LedgerEntry,
  type LocationId,
  type NewBookingInput,
  type Payment,
  type PaymentMethod,
  type SlotOption,
  type SlotQuery,
  type Specialist,
} from "./types";

export const DB_KEY = "joud-db";
const DB_VERSION = 3;
const CUSTOMER_ACTOR = "Customer (website)";
const BLOCKING = ["pending", "confirmed", "completed"];

const delay = (ms = 450) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let counter = 0;
function uid(prefix: string) {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function nextRef(prefix: string, existing: string[], start: number) {
  const numbers = existing.map((ref) => Number(ref.replace(/\D/g, ""))).filter(Boolean);
  return `${prefix}-${Math.max(start - 1, ...numbers) + 1}`;
}

/* ----------------------------- seed data ----------------------------- */

function iso(daysFromToday: number, clock: string) {
  return riyadhIso(addDays(riyadhToday(), daysFromToday), clockToMinutes(clock));
}

/** Every seeded specialist is off on Fridays, so upcoming demo visits skip them. */
function workingDay(daysFromToday: number) {
  let day = daysFromToday;
  while (day > 0 && weekdayOf(addDays(riyadhToday(), day)) === 5) day += 1;
  return day;
}

function address(
  id: string,
  locationId: LocationId,
  district: string,
  street: string,
  building: string,
): Address {
  return { id, label: "Home", district, street, building, locationId };
}

function buildSeed(): Db {
  const customers: Customer[] = [
    ["cu_1", "Lama Al-Otaibi", "riyadh", "Al Malqa", "Anas Bin Malik Rd", "lama@example.com"],
    ["cu_2", "Dana Al-Harbi", "riyadh", "Al Yasmin", "Al Thumamah Rd"],
    ["cu_3", "Shahad Al-Qahtani", "khobar", "Al Olaya", "Prince Turki St"],
    ["cu_4", "Abeer Al-Shehri", "khobar", "Al Rakah", "King Fahd Rd"],
    ["cu_5", "Rana Hakami", "jazan", "Al Shati", "Corniche Rd"],
    ["cu_6", "Joud Madkhali", "jazan", "Al Rawdah", "Prince Sultan St"],
    ["cu_7", "Haya Al-Dosari", "riyadh", "Al Narjis", "Northern Ring Rd"],
    ["cu_8", "Ghada Al-Mutairi", "khobar", "Al Hamra", "Al Khobar Corniche"],
    ["cu_9", "Nouf Al-Ghamdi", "jazan", "Al Safa", "King Abdulaziz Rd"],
  ].map(([id, name, city, district, street, email], index) => ({
    id,
    name,
    phone: `+96655111000${index + 1}`,
    email: email || undefined,
    addresses: [address(`ad_${index + 1}`, city as LocationId, district, street, String(10 + index))],
    createdAt: iso(-120, "10:00"),
  }));

  const home = (customerId: string) => customers.find((c) => c.id === customerId)!;
  const bookings: Booking[] = [];
  const entitlements: Entitlement[] = [];
  const payments: Payment[] = [];

  function seedBooking(options: {
    customerId: string;
    specialistId: string;
    serviceId?: string;
    packageId?: string;
    entitlementId?: string;
    day: number;
    clock: string;
    minutes: number;
    guests?: number;
    price: number;
    status: Booking["status"];
    paymentStatus: Booking["paymentStatus"];
  }) {
    const customer = home(options.customerId);
    const address = customer.addresses[0];
    const startsAt = iso(workingDay(options.day), options.clock);
    const endsAt = new Date(new Date(startsAt).getTime() + options.minutes * 60_000).toISOString();
    const ref = nextRef("BK", bookings.map((b) => b.ref), 1001);
    const booking: Booking = {
      id: `bk_${ref.slice(3)}`,
      ref,
      status: options.status,
      paymentStatus: options.paymentStatus,
      source: "online",
      locationId: address.locationId,
      serviceId: options.serviceId,
      packageId: options.packageId,
      entitlementId: options.entitlementId,
      specialistId: options.specialistId,
      customerId: customer.id,
      customer: { name: customer.name, phone: customer.phone },
      address,
      startsAt,
      endsAt,
      guests: options.guests ?? 1,
      price: options.price,
      history: [
        {
          at: new Date(new Date(startsAt).getTime() - 3 * 86_400_000).toISOString(),
          by: CUSTOMER_ACTOR,
          action: "created",
          note: "Website",
        },
      ],
      createdAt: new Date(Math.min(Date.now(), new Date(startsAt).getTime() - 3 * 86_400_000)).toISOString(),
    };
    if (options.status === "completed") {
      booking.history.push({
        at: endsAt,
        by: "Reception",
        action: "completed",
      });
    }
    bookings.push(booking);
    return booking;
  }

  function seedEntitlement(options: {
    customerId: string;
    packageId: string;
    specialistId: string;
    boughtDaysAgo: number;
    used: number;
    upcoming?: number[];
    paid?: boolean;
  }) {
    const pkg = findPackage(options.packageId)!;
    const customer = home(options.customerId);
    const locationId = customer.addresses[0].locationId;
    const ref = nextRef("PKG", entitlements.map((e) => e.ref), 3001);
    const purchasedAt = iso(-options.boughtDaysAgo, "11:00");
    const entitlement: Entitlement = {
      id: `en_${ref.slice(4)}`,
      ref,
      packageId: pkg.id,
      customerId: customer.id,
      locationId,
      purchasedAt,
      expiresAt: addMonthsIso(purchasedAt, pkg.validityMonths),
      sessionsTotal: pkg.sessions,
      sessionsUsed: 0,
      sessionsReserved: 0,
      price: pkg.price,
      paymentStatus: options.paid === false ? "unpaid" : "paid",
      ledger: [
        {
          id: `lg_${ref}_p`,
          at: purchasedAt,
          type: "purchased",
          delta: pkg.sessions,
          by: "Customer (website)",
          reason: "Bought online",
        },
      ],
    };
    entitlements.push(entitlement);
    payments.push({
      id: `pay_${ref.slice(4)}`,
      ref: nextRef("PAY", payments.map((p) => p.ref), 5001),
      createdAt: purchasedAt,
      kind: "package",
      entitlementId: entitlement.id,
      customerId: customer.id,
      locationId,
      amount: pkg.price,
      refundedAmount: 0,
      status: "paid",
      method: "online",
      providerRef: `MOY-${entitlement.id}`,
    });

    const minutes = pkg.minutes * pkg.guests;
    const addLedger = (entry: Omit<LedgerEntry, "id" | "by">) =>
      entitlement.ledger.push({ ...entry, id: uid("lg"), by: "System" });

    for (let index = 0; index < options.used; index += 1) {
      const day = -options.boughtDaysAgo + 3 + index * 7;
      const booking = seedBooking({
        customerId: customer.id,
        specialistId: options.specialistId,
        packageId: pkg.id,
        entitlementId: entitlement.id,
        day: Math.min(day, -1),
        clock: "14:00",
        minutes,
        guests: pkg.guests,
        price: 0,
        status: "completed",
        paymentStatus: "paid",
      });
      entitlement.sessionsUsed += 1;
      addLedger({ at: booking.endsAt, type: "reserved", delta: -1, bookingId: booking.id, reason: `Visit ${booking.ref}` });
      addLedger({ at: booking.endsAt, type: "used", delta: 0, bookingId: booking.id, reason: `Visit ${booking.ref} completed` });
    }

    for (const day of options.upcoming ?? []) {
      const booking = seedBooking({
        customerId: customer.id,
        specialistId: options.specialistId,
        packageId: pkg.id,
        entitlementId: entitlement.id,
        day,
        clock: "16:00",
        minutes,
        guests: pkg.guests,
        price: 0,
        status: "confirmed",
        paymentStatus: "paid",
      });
      entitlement.sessionsReserved += 1;
      addLedger({ at: booking.createdAt, type: "reserved", delta: -1, bookingId: booking.id, reason: `Visit ${booking.ref}` });
    }
  }

  seedEntitlement({ customerId: "cu_2", packageId: "calm-package", specialistId: "sp_noura", boughtDaysAgo: 10, used: 1, upcoming: [3] });
  seedEntitlement({ customerId: "cu_1", packageId: "luxury-wellness", specialistId: "sp_noura", boughtDaysAgo: 55, used: 2, upcoming: [2] });
  seedEntitlement({ customerId: "cu_3", packageId: "queen-mom", specialistId: "sp_reem", boughtDaysAgo: 40, used: 4 });
  seedEntitlement({ customerId: "cu_6", packageId: "love", specialistId: "sp_amal", boughtDaysAgo: 70, used: 2 });
  seedEntitlement({ customerId: "cu_5", packageId: "partner", specialistId: "sp_amal", boughtDaysAgo: 2, used: 0 });

  seedBooking({
    customerId: "cu_1",
    specialistId: "sp_noura",
    serviceId: "hot-stone",
    day: 5,
    clock: "12:00",
    minutes: 60,
    price: 299,
    status: "confirmed",
    paymentStatus: "paid",
  });
  seedBooking({
    customerId: "cu_2",
    specialistId: "sp_noura",
    serviceId: "detox",
    day: -20,
    clock: "13:00",
    minutes: 90,
    price: 460,
    status: "completed",
    paymentStatus: "paid",
  });
  seedBooking({
    customerId: "cu_2",
    specialistId: "sp_noura",
    serviceId: "cupping",
    day: -12,
    clock: "17:00",
    minutes: 60,
    price: 299,
    status: "cancelled",
    paymentStatus: "paid",
  });
  seedBooking({
    customerId: "cu_3",
    specialistId: "sp_reem",
    serviceId: "bridal",
    day: 4,
    clock: "15:00",
    minutes: 90,
    price: 400,
    status: "confirmed",
    paymentStatus: "paid",
  });

  for (const booking of bookings.filter((item) => item.status !== "pending" && item.paymentStatus === "paid" && !item.entitlementId)) {
    payments.push({
      id: `pay_${booking.id}`,
      ref: nextRef("PAY", payments.map((p) => p.ref), 5001),
      createdAt: booking.createdAt,
      kind: "booking",
      bookingId: booking.id,
      customerId: booking.customerId,
      locationId: booking.locationId,
      amount: booking.price,
      refundedAmount: 0,
      status: "paid",
      method: "online",
      providerRef: `MOY-${booking.id}`,
    });
  }

  return { version: DB_VERSION, customers, bookings, entitlements, payments, notifications: [], sessionCustomerId: null };
}

/* ------------------------------ store ------------------------------ */

let seedCache: Db | null = null;
function seed(): Db {
  if (!seedCache) seedCache = buildSeed();
  return seedCache;
}

export function readDb(): Db {
  const raw = readStoredValue(DB_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Db;
      if (parsed.version === DB_VERSION) return parsed;
    } catch {
      // Fall through to the seed when the stored value is unreadable.
    }
  }
  return seed();
}

/** Applies a change to a copy of the database and persists it. Throwing leaves the data untouched. */
function mutate<T>(change: (db: Db) => T): T {
  const next = structuredClone(readDb());
  const result = change(next);
  releaseExpiredHolds(next);
  sweepReminders(next);
  writeStored(DB_KEY, next);
  return result;
}

export function useDb(): { db: Db; ready: boolean } {
  const raw = useSyncExternalStore(
    subscribeStored,
    () => readStoredValue(DB_KEY),
    () => null,
  );
  const ready = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Db;
      if (parsed.version === DB_VERSION) return { db: parsed, ready };
    } catch {
      // Unreadable value: fall back to the seed.
    }
  }

  return { db: seed(), ready };
}

/** Pending bookings that were not paid within the hold are cancelled and their session returned. */
export function releaseExpiredHolds(db: Db, now = Date.now()) {
  const holdMs = RULES.slotHoldMinutes * 60_000;
  let changed = false;

  for (const booking of db.bookings) {
    if (booking.status !== "pending") continue;
    if (now - new Date(booking.createdAt).getTime() < holdMs) continue;
    cancelInPlace(db, booking, "Payment hold expired", "System", now);
    notify(db, { customerId: booking.customerId, kind: "expired", bookingId: booking.id, key: `expired:${booking.id}` });
    changed = true;
  }

  return changed;
}

export function hasExpiredHolds(db: Db, now = Date.now()) {
  const holdMs = RULES.slotHoldMinutes * 60_000;
  return db.bookings.some(
    (booking) => booking.status === "pending" && now - new Date(booking.createdAt).getTime() >= holdMs,
  );
}

export function sweepHolds() {
  const db = readDb();
  if (!hasExpiredHolds(db) && !hasDueReminders(db)) return;
  mutate(() => undefined);
}

/* ---------------------------- notifications ---------------------------- */

/**
 * Adds a message for a customer unless one with the same `key` already exists.
 * Use it from any engine function: `notify(db, { customerId, kind: "info", key, message })` for a custom message.
 */
export function notify(
  db: Db,
  input: Pick<AppNotification, "customerId" | "kind" | "key"> & Partial<Pick<AppNotification, "bookingId" | "message">>,
  now = Date.now(),
) {
  if (db.notifications.some((item) => item.customerId === input.customerId && item.key === input.key)) return false;
  db.notifications.push({ id: uid("nt"), createdAt: new Date(now).toISOString(), ...input });
  return true;
}

function reminderKey(booking: Booking) {
  return `reminder:${booking.id}:${booking.startsAt}`;
}

/** Visits in the 24–48 hour window that have not been reminded yet. */
export function hasDueReminders(db: Db, now = Date.now()) {
  return db.bookings.some(
    (booking) =>
      inReminderWindow(booking, now) &&
      !db.notifications.some((item) => item.customerId === booking.customerId && item.key === reminderKey(booking)),
  );
}

/** Sends the "you can still reschedule" reminder once per visit time. */
export function sweepReminders(db: Db, now = Date.now()) {
  let changed = false;
  for (const booking of db.bookings) {
    if (!inReminderWindow(booking, now)) continue;
    changed =
      notify(db, { customerId: booking.customerId, kind: "reminder", bookingId: booking.id, key: reminderKey(booking) }, now) ||
      changed;
  }
  return changed;
}

export function markNotificationsRead(customerId: string, ids?: string[]) {
  const at = new Date().toISOString();
  mutate((db) => {
    for (const item of db.notifications) {
      if (item.customerId !== customerId || item.readAt) continue;
      if (!ids || ids.includes(item.id)) item.readAt = at;
    }
  });
}

/* --------------------------- availability --------------------------- */

function productFor(query: { serviceId?: string; packageId?: string }) {
  const pkg = findPackage(query.packageId);
  const service = findService(query.serviceId);
  return { pkg, service };
}

function qualifies(specialist: Specialist, locationId: LocationId, serviceId: string | undefined) {
  if (!specialist.active || !specialist.locationIds.includes(locationId)) return false;
  return serviceId === undefined || specialist.serviceIds.includes(serviceId);
}

export function computeSlots(db: Db, query: SlotQuery, now = Date.now()): SlotOption[] {
  const location = findLocation(query.locationId);
  const { pkg, service } = productFor(query);
  const product = pkg ?? service;
  if (!location?.active || !product?.active || !product.locationIds.includes(query.locationId)) return [];

  const today = riyadhToday();
  if (query.date < today || query.date > addDays(today, RULES.maxDaysAhead)) return [];

  const guests = pkg ? Math.max(pkg.guests, query.guests ?? pkg.guests) : 1;
  const duration = product.minutes * guests + Math.max(0, query.extraMinutes ?? 0);
  const serviceId = pkg ? pkg.serviceId : service?.id;
  const weekday = weekdayOf(query.date);
  const holdMs = RULES.slotHoldMinutes * 60_000;
  const grouped = new Map<number, SlotOption>();

  for (const specialist of specialists) {
    if (!qualifies(specialist, query.locationId, serviceId)) continue;
    const shift = specialist.schedule.find((day) => day.weekday === weekday);
    if (!shift?.working) continue;
    if (specialist.locationIds.length > 1 && shift.locationId && shift.locationId !== query.locationId) continue;
    if (specialist.leaves.some((leave) => query.date >= leave.from && query.date <= leave.to)) continue;

    const gapMs = specialist.travelGapMinutes * 60_000;
    const busy = db.bookings.filter(
      (booking) =>
        booking.specialistId === specialist.id &&
        BLOCKING.includes(booking.status) &&
        booking.id !== query.excludeBookingId &&
        !(booking.status === "pending" && now - new Date(booking.createdAt).getTime() >= holdMs),
    );
    const shiftEnd = clockToMinutes(shift.end);

    for (let start = clockToMinutes(shift.start); start + duration <= shiftEnd; start += RULES.slotStepMinutes) {
      const startMs = new Date(riyadhIso(query.date, start)).getTime();
      const endMs = startMs + duration * 60_000;
      if (startMs < now) continue;
      const clash = busy.some((booking) => {
        const otherStart = new Date(booking.startsAt).getTime();
        const otherEnd = new Date(booking.endsAt).getTime();
        return startMs < otherEnd + gapMs && endMs + gapMs > otherStart;
      });
      if (clash) continue;

      const slot = grouped.get(startMs) ?? {
        startsAt: new Date(startMs).toISOString(),
        endsAt: new Date(endMs).toISOString(),
        specialistIds: [],
      };
      slot.specialistIds.push(specialist.id);
      grouped.set(startMs, slot);
    }
  }

  return [...grouped.entries()].sort(([a], [b]) => a - b).map(([, slot]) => slot);
}

/** Specialists who work in this city and can perform the service (any service for a mixed package). */
export function eligibleSpecialists(locationId: LocationId, serviceId: string | undefined) {
  return specialists.filter((specialist) => qualifies(specialist, locationId, serviceId));
}

/** The specialist who served this package most recently, suggested again for the next session. */
export function lastSpecialistFor(db: Db, entitlementId: string) {
  return db.bookings
    .filter((booking) => booking.entitlementId === entitlementId && booking.status !== "cancelled")
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0]?.specialistId;
}

function leastBusy(db: Db, specialistIds: string[], startsAt: string) {
  const day = riyadhParts(startsAt).date;
  const load = (id: string) =>
    db.bookings.filter(
      (booking) =>
        booking.specialistId === id &&
        BLOCKING.includes(booking.status) &&
        riyadhParts(booking.startsAt).date === day,
    ).length;

  return [...specialistIds].sort((a, b) => load(a) - load(b))[0];
}

/* ------------------------------ auth ------------------------------ */

export async function sendOtp(phoneInput: string) {
  await delay(500);
  const phone = normalizePhone(phoneInput);
  if (!isValidPhone(phone)) throw new EngineError("VALIDATION_FAILED", "phone");
  return { phone };
}

/** Preview mode: any 4–6 digit code is accepted. */
export async function verifyOtp(phoneInput: string, code: string) {
  await delay(450);
  const phone = normalizePhone(phoneInput);
  if (!/^\d{4,6}$/.test(code)) throw new EngineError("OTP_INVALID");
  const existing = readDb().customers.find((customer) => customer.phone === phone);

  if (existing) {
    mutate((db) => {
      db.sessionCustomerId = existing.id;
    });
  }

  return { phone, customer: existing ?? null };
}

export function phoneIsRegistered(phoneInput: string) {
  const phone = normalizePhone(phoneInput);
  return readDb().customers.some((customer) => customer.phone === phone);
}

export async function registerCustomer(input: {
  phone: string;
  name: string;
  email?: string;
  address?: Omit<Address, "id">;
}) {
  await delay(400);
  const phone = normalizePhone(input.phone);
  const name = input.name.trim();
  if (!isValidPhone(phone)) throw new EngineError("VALIDATION_FAILED", "phone");
  if (name.length < 2) throw new EngineError("VALIDATION_FAILED", "name");
  const email = input.email?.trim();
  if (email && !/^\S+@\S+\.\S+$/.test(email)) throw new EngineError("VALIDATION_FAILED", "email");

  return mutate((db) => {
    const existing = db.customers.find((customer) => customer.phone === phone);
    if (existing) {
      db.sessionCustomerId = existing.id;
      return existing;
    }
    const customer: Customer = {
      id: uid("cu"),
      name,
      phone,
      email: email || undefined,
      addresses: input.address
        ? [{ ...input.address, id: uid("ad"), label: input.address.label.trim() || "Home" }]
        : [],
      createdAt: new Date().toISOString(),
    };
    db.customers.push(customer);
    db.sessionCustomerId = customer.id;
    return customer;
  });
}

export function logout() {
  mutate((db) => {
    db.sessionCustomerId = null;
  });
}

export async function updateProfile(customerId: string, patch: { name: string; email?: string }) {
  await delay(300);
  const name = patch.name.trim();
  if (name.length < 2) throw new EngineError("VALIDATION_FAILED", "name");
  const email = patch.email?.trim();
  if (email && !/^\S+@\S+\.\S+$/.test(email)) throw new EngineError("VALIDATION_FAILED", "email");

  mutate((db) => {
    const customer = db.customers.find((item) => item.id === customerId);
    if (!customer) throw new EngineError("NOT_FOUND", "customer");
    customer.name = name;
    customer.email = email || undefined;
  });
}

/* ---------------------------- addresses ---------------------------- */

export function validateAddress(input: Omit<Address, "id">) {
  if (!input.district.trim()) throw new EngineError("VALIDATION_FAILED", "district");
  if (!input.street.trim()) throw new EngineError("VALIDATION_FAILED", "street");
  const location = findLocation(input.locationId);
  if (!location?.active) throw new EngineError("SLOT_UNAVAILABLE", "location_off");
  if (location.area && input.lat !== undefined && input.lng !== undefined) {
    const distance = distanceKm(location.area, { lat: input.lat, lng: input.lng });
    if (distance > location.area.radiusKm) {
      throw new EngineError("OUT_OF_COVERAGE", `${Math.round(distance)}/${location.area.radiusKm}`);
    }
  }
}

export async function saveAddress(customerId: string, input: Omit<Address, "id"> & { id?: string }) {
  await delay(300);
  validateAddress(input);

  return mutate((db) => {
    const customer = db.customers.find((item) => item.id === customerId);
    if (!customer) throw new EngineError("NOT_FOUND", "customer");
    const saved: Address = { ...input, id: input.id ?? uid("ad"), label: input.label.trim() || "Home" };
    const index = customer.addresses.findIndex((item) => item.id === saved.id);
    if (index >= 0) customer.addresses[index] = saved;
    else customer.addresses.push(saved);
    return saved;
  });
}

export async function deleteAddress(customerId: string, addressId: string) {
  await delay(250);
  mutate((db) => {
    const customer = db.customers.find((item) => item.id === customerId);
    if (!customer) throw new EngineError("NOT_FOUND", "customer");
    customer.addresses = customer.addresses.filter((item) => item.id !== addressId);
  });
}

/* ----------------------------- bookings ----------------------------- */

function addLedger(entitlement: Entitlement, entry: Omit<LedgerEntry, "id" | "at" | "by">) {
  entitlement.ledger.push({ ...entry, id: uid("lg"), at: new Date().toISOString(), by: CUSTOMER_ACTOR });
}

function releaseSession(entitlement: Entitlement, booking: Booking) {
  const reserved = entitlement.ledger.filter((entry) => entry.bookingId === booking.id && entry.type === "reserved").length;
  const returned = entitlement.ledger.filter(
    (entry) => entry.bookingId === booking.id && (entry.type === "released" || entry.type === "used"),
  ).length;
  if (reserved <= returned) return;
  entitlement.sessionsReserved = Math.max(0, entitlement.sessionsReserved - 1);
  // Give back the add-on credits this visit was using.
  for (const used of booking.addOns ?? []) {
    if (used.source !== "package") continue;
    const credit = entitlement.addOns?.find((item) => item.id === used.id);
    if (credit) credit.visitsUsed = Math.max(0, credit.visitsUsed - 1);
  }
  addLedger(entitlement, {
    type: "released",
    delta: 1,
    bookingId: booking.id,
    reason: `Visit ${booking.ref} cancelled`,
  });
}

function cancelInPlace(db: Db, booking: Booking, reason: string, by: string, now = Date.now()) {
  booking.status = "cancelled";
  booking.history.push({ at: new Date(now).toISOString(), by, action: "cancelled", note: reason });
  if (booking.paymentStatus === "pending" || booking.paymentStatus === "failed") {
    booking.paymentStatus = "unpaid";
  }

  const entitlement = db.entitlements.find((item) => item.id === booking.entitlementId);
  if (!entitlement) return;
  releaseSession(entitlement, booking);

  const stillActive = db.bookings.some(
    (item) => item.entitlementId === entitlement.id && item.id !== booking.id && BLOCKING.includes(item.status),
  );
  if (!stillActive && (entitlement.paymentStatus === "pending" || entitlement.paymentStatus === "unpaid")) {
    db.entitlements = db.entitlements.filter((item) => item.id !== entitlement.id);
  }
}

/** Reserves the slot. The booking stays `pending` until payment is confirmed (or the hold expires). */
export async function createBooking(customerId: string, input: NewBookingInput): Promise<Booking> {
  await delay(500);

  return mutate((db) => {
    const customer = db.customers.find((item) => item.id === customerId);
    if (!customer) throw new EngineError("NOT_FOUND", "customer");
    validateAddress(input.address);

    const { pkg, service } = productFor(input);
    const product = pkg ?? service;
    if (!product || (pkg && service)) throw new EngineError("VALIDATION_FAILED", "product");
    if (!product.active || !product.locationIds.includes(input.locationId)) {
      throw new EngineError("SLOT_UNAVAILABLE", "not_in_location");
    }

    let entitlement: Entitlement | undefined;
    if (input.entitlementId) {
      entitlement = db.entitlements.find((item) => item.id === input.entitlementId);
      if (!entitlement || entitlement.customerId !== customer.id || entitlement.packageId !== pkg?.id) {
        throw new EngineError("CONFLICT", "entitlement");
      }
      if (new Date(entitlement.expiresAt).getTime() < new Date(input.startsAt).getTime()) {
        throw new EngineError("PACKAGE_EXPIRED");
      }
      if (entitlement.sessionsTotal - entitlement.sessionsUsed - entitlement.sessionsReserved <= 0) {
        throw new EngineError("PACKAGE_SESSIONS_EXHAUSTED");
      }
    }

    const guests = guestsFor(product, input.guests);

    // Add-ons: a service is 1 visit × 1 person; a package purchase may cover several visits and people;
    // a later package visit uses the credits it still has and may buy extras for this visit only.
    let purchased: AddOnLine[] = [];
    let extras: AddOnLine[] = [];
    const fromCredits: AddOnCredit[] = [];
    if (entitlement) {
      extras = cleanAddOnLines(input.extraAddOns, 1, guests);
      for (const credit of entitlement.addOns ?? []) {
        if (input.useCredits?.includes(credit.id) && credit.visitsUsed < credit.visitsTotal) fromCredits.push(credit);
      }
    } else {
      purchased = cleanAddOnLines(input.addOns, pkg ? pkg.sessions : 1, guests);
    }
    const visitAddOns: VisitAddOn[] = [
      ...(pkg && !entitlement ? purchased.map((line) => ({ id: line.id, people: line.people, source: "package" as const })) : []),
      ...(service ? purchased.map((line) => ({ id: line.id, people: 1, source: "paid" as const })) : []),
      ...fromCredits.map((credit) => ({ id: credit.id, people: credit.people, source: "package" as const })),
      ...extras.map((line) => ({ id: line.id, people: line.people, source: "paid" as const })),
    ];

    const slot = computeSlots(db, {
      locationId: input.locationId,
      serviceId: service?.id,
      packageId: pkg?.id,
      date: riyadhParts(input.startsAt).date,
      guests,
      extraMinutes: visitAddOnMinutes(visitAddOns),
    }).find((option) => new Date(option.startsAt).getTime() === new Date(input.startsAt).getTime());
    if (!slot) throw new EngineError("SLOT_UNAVAILABLE", "taken");

    let specialistId = input.specialistId;
    if (specialistId === "any") specialistId = leastBusy(db, slot.specialistIds, slot.startsAt);
    else if (!slot.specialistIds.includes(specialistId)) throw new EngineError("SLOT_UNAVAILABLE", "specialist_busy");

    const now = new Date().toISOString();
    const price = priceFor(product, guests, purchased);
    const extrasCost = addOnCost(extras);
    const refNumber = nextRef("BK", db.bookings.map((b) => b.ref), 1001);
    const bookingId = uid("bk");
    const covered = Boolean(entitlement);

    if (pkg && !entitlement) {
      const ref = nextRef("PKG", db.entitlements.map((e) => e.ref), 3001);
      entitlement = {
        id: uid("en"),
        ref,
        packageId: pkg.id,
        customerId: customer.id,
        locationId: input.locationId,
        purchasedAt: now,
        expiresAt: addMonthsIso(now, pkg.validityMonths),
        sessionsTotal: pkg.sessions,
        sessionsUsed: 0,
        sessionsReserved: 0,
        price: price.total,
        paymentStatus: "pending",
        ledger: [],
        addOns:
          purchased.length > 0
            ? purchased.map((line) => ({ id: line.id, people: line.people, visitsTotal: line.visits, visitsUsed: 0 }))
            : undefined,
      };
      addLedger(entitlement, { type: "purchased", delta: pkg.sessions, reason: "Bought online" });
      db.entitlements.push(entitlement);
    }
    if (entitlement) {
      entitlement.sessionsReserved += 1;
      for (const used of visitAddOns) {
        if (used.source !== "package") continue;
        const credit = entitlement.addOns?.find((item) => item.id === used.id);
        if (credit) credit.visitsUsed += 1;
      }
      addLedger(entitlement, { type: "reserved", delta: -1, bookingId, reason: `Visit ${refNumber}` });
    }

    const userNotes = input.notes?.trim();
    // A covered visit with nothing extra to pay is confirmed straight away.
    const confirmedNow = covered && entitlement?.paymentStatus === "paid" && extrasCost === 0;
    const booking: Booking = {
      id: bookingId,
      ref: refNumber,
      status: confirmedNow ? "confirmed" : "pending",
      paymentStatus: confirmedNow ? "paid" : "pending",
      source: "online",
      locationId: input.locationId,
      serviceId: service?.id,
      packageId: pkg?.id,
      entitlementId: entitlement?.id,
      specialistId,
      customerId: customer.id,
      customer: { name: customer.name, phone: customer.phone },
      address: { ...input.address, id: input.address.id ?? uid("ad") },
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      guests,
      addOns: visitAddOns.length > 0 ? visitAddOns : undefined,
      price: pkg ? extrasCost : price.total,
      notes: userNotes || undefined,
      history: [{ at: now, by: CUSTOMER_ACTOR, action: "created", note: "Website" }],
      createdAt: now,
    };
    db.bookings.push(booking);
    if (confirmedNow) notify(db, { customerId: customer.id, kind: "confirmed", bookingId: booking.id, key: `confirmed:${booking.id}` });

    const saved = customer.addresses.some((item) => item.id === input.address.id);
    if (!saved) customer.addresses.push(booking.address);

    return booking;
  });
}

export type CardOutcome = "success" | "fail";

/** Mock gateway. Returns the confirmed booking; throws PAYMENT_FAILED on a declined payment. */
export async function payBooking(
  customerId: string,
  bookingId: string,
  method: PaymentMethod,
  outcome: CardOutcome = "success",
): Promise<Booking> {
  await delay(900);

  return mutate((db) => {
    const booking = db.bookings.find((item) => item.id === bookingId && item.customerId === customerId);
    if (!booking) throw new EngineError("NOT_FOUND", "booking");
    if (booking.status !== "pending") throw new EngineError("CONFLICT", "status");

    if (outcome === "fail") {
      booking.paymentStatus = "failed";
      throw new EngineError("PAYMENT_FAILED");
    }

    const now = new Date().toISOString();
    const entitlement = db.entitlements.find((item) => item.id === booking.entitlementId);
    const buyingPackage = entitlement && (entitlement.paymentStatus === "pending" || entitlement.paymentStatus === "unpaid");
    const amount = buyingPackage ? entitlement.price : booking.price;

    if (amount > 0) {
      db.payments.push({
        id: uid("pay"),
        ref: nextRef("PAY", db.payments.map((p) => p.ref), 5001),
        createdAt: now,
        kind: buyingPackage ? "package" : "booking",
        bookingId: buyingPackage ? undefined : booking.id,
        entitlementId: buyingPackage ? entitlement.id : undefined,
        customerId,
        locationId: booking.locationId,
        amount,
        refundedAmount: 0,
        status: "paid",
        method,
        providerRef: `MOY-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      });
    }

    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    notify(db, { customerId, kind: "confirmed", bookingId: booking.id, key: `confirmed:${booking.id}` });
    booking.history.push({ at: now, by: CUSTOMER_ACTOR, action: "paid", note: method });
    if (buyingPackage) {
      entitlement.paymentStatus = "paid";
      for (const other of db.bookings) {
        if (other.entitlementId === entitlement.id && other.status !== "cancelled") other.paymentStatus = "paid";
      }
    }

    return booking;
  });
}

/** Releases a held (unpaid) booking when the customer goes back and changes their choices. */
export function discardHold(customerId: string, bookingId: string) {
  mutate((db) => {
    const booking = db.bookings.find((item) => item.id === bookingId && item.customerId === customerId);
    if (booking?.status === "pending") cancelInPlace(db, booking, "Changed by customer", CUSTOMER_ACTOR);
  });
}

function withinFreeWindow(startsAt: string, now = Date.now()) {
  return new Date(startsAt).getTime() - now >= RULES.freeChangeWindowHours * 3_600_000;
}

export function canChangeBooking(booking: Booking, now = Date.now()) {
  if (booking.status === "pending") return true;
  return booking.status === "confirmed" && withinFreeWindow(booking.startsAt, now);
}

export async function cancelBooking(customerId: string, bookingId: string, reason: string) {
  await delay(500);
  if (!reason.trim()) throw new EngineError("VALIDATION_FAILED", "reason");

  return mutate((db) => {
    const booking = db.bookings.find((item) => item.id === bookingId && item.customerId === customerId);
    if (!booking) throw new EngineError("NOT_FOUND", "booking");
    if (booking.status !== "pending" && booking.status !== "confirmed") throw new EngineError("CONFLICT", "status");
    if (!canChangeBooking(booking)) throw new EngineError("CONFLICT", "within_window");
    cancelInPlace(db, booking, reason.trim(), CUSTOMER_ACTOR);
    return booking;
  });
}

export async function rescheduleBooking(
  customerId: string,
  bookingId: string,
  input: { startsAt: string; specialistId: string | "any"; reason: string },
) {
  await delay(600);
  if (!input.reason.trim()) throw new EngineError("VALIDATION_FAILED", "reason");

  return mutate((db) => {
    const booking = db.bookings.find((item) => item.id === bookingId && item.customerId === customerId);
    if (!booking) throw new EngineError("NOT_FOUND", "booking");
    if (booking.status !== "pending" && booking.status !== "confirmed") throw new EngineError("CONFLICT", "status");
    if (!canChangeBooking(booking)) throw new EngineError("CONFLICT", "within_window");

    const { pkg, service } = productFor(booking);
    const product = pkg ?? service;
    if (!product) throw new EngineError("NOT_FOUND", "product");

    const entitlement = db.entitlements.find((item) => item.id === booking.entitlementId);
    if (entitlement && new Date(entitlement.expiresAt).getTime() < new Date(input.startsAt).getTime()) {
      throw new EngineError("PACKAGE_EXPIRED");
    }

    const slot = computeSlots(db, {
      locationId: booking.locationId,
      serviceId: service?.id,
      packageId: pkg?.id,
      date: riyadhParts(input.startsAt).date,
      guests: booking.guests,
      extraMinutes: visitAddOnMinutes(booking.addOns),
      excludeBookingId: booking.id,
    }).find((option) => new Date(option.startsAt).getTime() === new Date(input.startsAt).getTime());
    if (!slot) throw new EngineError("SLOT_UNAVAILABLE", "taken");

    let specialistId = input.specialistId;
    if (specialistId === "any") specialistId = leastBusy(db, slot.specialistIds, slot.startsAt);
    else if (!slot.specialistIds.includes(specialistId)) throw new EngineError("SLOT_UNAVAILABLE", "specialist_busy");

    const format = (value: string) => {
      const parts = riyadhParts(value);
      const clock = `${String(Math.floor(parts.minutes / 60)).padStart(2, "0")}:${String(parts.minutes % 60).padStart(2, "0")}`;
      return `${parts.date.slice(8)}/${parts.date.slice(5, 7)} ${clock}`;
    };
    booking.history.push({
      at: new Date().toISOString(),
      by: CUSTOMER_ACTOR,
      action: "rescheduled",
      note: `${format(booking.startsAt)} → ${format(slot.startsAt)}. ${input.reason.trim()}`,
    });
    booking.startsAt = slot.startsAt;
    booking.endsAt = slot.endsAt;
    booking.specialistId = specialistId;
    notify(db, {
      customerId,
      kind: "rescheduled",
      bookingId: booking.id,
      key: `rescheduled:${booking.id}:${slot.startsAt}`,
    });
    return booking;
  });
}

/* ------------------------------ queries ------------------------------ */

export function entitlementBookings(db: Db, entitlementId: string) {
  return db.bookings
    .filter((booking) => booking.entitlementId === entitlementId)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function customerBookings(db: Db, customerId: string) {
  return db.bookings.filter((booking) => booking.customerId === customerId);
}

export function customerEntitlements(db: Db, customerId: string) {
  return db.entitlements
    .filter((item) => item.customerId === customerId)
    .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
}

export { entitlementState, isUsablePackage };
