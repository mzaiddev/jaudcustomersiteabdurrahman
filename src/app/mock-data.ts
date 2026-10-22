import { productCatalogue, type ProductId } from "./product-catalogue";
import type {
  Location,
  LocationId,
  ScheduleDay,
  Service,
  Specialist,
  SpaPackage,
} from "./types";

export const locations: Location[] = [
  {
    id: "khobar",
    adminId: "loc_khobar",
    name: { ar: "الخبر", en: "Khobar" },
    active: true,
    area: { lat: 26.2172, lng: 50.1971, radiusKm: 30 },
  },
  {
    id: "riyadh",
    adminId: "loc_riyadh",
    name: { ar: "الرياض", en: "Riyadh" },
    active: true,
    area: { lat: 24.7136, lng: 46.6753, radiusKm: 40 },
  },
  {
    id: "jazan",
    adminId: "loc_jazan",
    name: { ar: "جازان", en: "Jazan" },
    active: true,
    area: { lat: 16.8892, lng: 42.5511, radiusKm: 25 },
  },
];

const ALL_CITIES: LocationId[] = ["khobar", "riyadh", "jazan"];

/** Ids used by the admin app, so exported bookings reference the right catalogue rows. */
const adminIds: Record<ProductId, string> = {
  "calm-massage": "svc_6",
  detox: "svc_7",
  aljoudi: "svc_8",
  postpartum: "svc_9",
  bridal: "svc_10",
  "gym-recovery": "svc_11",
  "hot-stone": "svc_12",
  cupping: "svc_13",
  "vip-detox": "svc_15",
  "queen-mom": "pkg_1",
  "luxury-wellness": "pkg_2",
  love: "pkg_3",
  partner: "pkg_4",
  friends: "pkg_5",
  "calm-package": "pkg_14",
  "vip-detox-package": "pkg_16",
};

/** Service performed at each package visit. Luxury Wellness is mixed (any service). */
const packageService: Partial<Record<ProductId, string>> = {
  love: "calm-massage",
  "queen-mom": "postpartum",
  "calm-package": "calm-massage",
  partner: "calm-massage",
  friends: "calm-massage",
  "vip-detox-package": "vip-detox",
};

/** Luxury Wellness has no fixed length in the catalogue; the admin treats it as 90 minutes. */
const MIXED_PACKAGE_MINUTES = 90;

export const services: Service[] = productCatalogue
  .filter((product) => product.kind === "service")
  .map((product) => ({
    id: product.id,
    adminId: adminIds[product.id],
    name: product.name,
    description: product.description,
    price: product.price,
    minutes: product.minutes,
    locationIds: product.riyadhOnly ? ["riyadh"] : ALL_CITIES,
    vip: Boolean(product.riyadhOnly),
    active: true,
  }));

export const packages: SpaPackage[] = productCatalogue
  .filter((product) => product.kind === "package")
  .map((product) => ({
    id: product.id,
    adminId: adminIds[product.id],
    name: product.name,
    description: product.description,
    price: product.price,
    // Visits to book. One-visit group packages (Friends, Partner) list one session per guest in the catalogue.
    sessions: product.repeat ? product.sessions : 1,
    guests: product.guests,
    extraGuestPrice: product.extraPrice,
    minutes: product.minutes || MIXED_PACKAGE_MINUTES,
    serviceId: packageService[product.id],
    validityMonths: 2,
    locationIds: product.riyadhOnly ? ["riyadh"] : ALL_CITIES,
    vip: Boolean(product.riyadhOnly),
    active: true,
  }));

export function findService(id: string | undefined) {
  return services.find((service) => service.id === id);
}

export function findPackage(id: string | undefined) {
  return packages.find((pkg) => pkg.id === id);
}

export function findLocation(id: string | undefined) {
  return locations.find((location) => location.id === id);
}

/** Day-of-week shifts. 0 = Sunday … 6 = Saturday. */
function shifts(
  start: string,
  end: string,
  offDays: number[],
  cityByDay: Partial<Record<number, LocationId>> = {},
): ScheduleDay[] {
  return Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    working: !offDays.includes(weekday),
    start,
    end,
    locationId: cityByDay[weekday],
  }));
}

const nonVipServices = services.filter((service) => !service.vip).map((service) => service.id);

function leaveIn(days: number): Specialist["leaves"] {
  const from = new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
  const to = new Date(Date.now() + (days + 2) * 86_400_000).toISOString().slice(0, 10);
  return [{ id: "lv_sara_1", from, to, reason: "Leave" }];
}

export const specialists: Specialist[] = [
  {
    id: "sp_noura",
    name: { ar: "نورة", en: "Noura" },
    locationIds: ["riyadh"],
    serviceIds: nonVipServices,
    travelGapMinutes: 30,
    schedule: shifts("10:00", "22:00", [5]),
    leaves: [],
    active: true,
    photo: "specialistNoura",
  },
  {
    id: "sp_fatimah",
    name: { ar: "فاطمة", en: "Fatimah" },
    locationIds: ["riyadh"],
    serviceIds: ["detox", "vip-detox"],
    travelGapMinutes: 45,
    schedule: shifts("12:00", "21:00", [5, 6]),
    leaves: [],
    active: true,
  },
  {
    id: "sp_sara",
    name: { ar: "سارة", en: "Sara" },
    locationIds: ["riyadh", "khobar"],
    serviceIds: ["calm-massage", "hot-stone", "cupping", "aljoudi", "gym-recovery"],
    travelGapMinutes: 30,
    schedule: shifts("10:00", "20:00", [5], {
      0: "riyadh",
      1: "riyadh",
      2: "riyadh",
      3: "khobar",
      4: "khobar",
      6: "khobar",
    }),
    leaves: leaveIn(9),
    active: true,
    photo: "specialistSara",
  },
  {
    id: "sp_reem",
    name: { ar: "ريم", en: "Reem" },
    locationIds: ["khobar"],
    serviceIds: nonVipServices,
    travelGapMinutes: 30,
    schedule: shifts("11:00", "22:00", [5]),
    leaves: [],
    active: true,
  },
  {
    id: "sp_hind",
    name: { ar: "هند", en: "Hind" },
    locationIds: ["khobar"],
    serviceIds: ["calm-massage", "postpartum", "bridal", "hot-stone"],
    travelGapMinutes: 30,
    schedule: shifts("10:00", "19:00", [4, 5]),
    leaves: [],
    active: true,
  },
  {
    id: "sp_amal",
    name: { ar: "أمل", en: "Amal" },
    locationIds: ["jazan"],
    serviceIds: nonVipServices,
    travelGapMinutes: 40,
    schedule: shifts("10:00", "21:00", [5]),
    leaves: [],
    active: true,
  },
  {
    id: "sp_maha",
    name: { ar: "مها", en: "Maha" },
    locationIds: ["jazan"],
    serviceIds: ["calm-massage", "hot-stone", "cupping", "gym-recovery"],
    travelGapMinutes: 40,
    schedule: shifts("13:00", "22:00", [5, 6]),
    leaves: [],
    active: true,
  },
];

export function findSpecialist(id: string) {
  return specialists.find((specialist) => specialist.id === id);
}
