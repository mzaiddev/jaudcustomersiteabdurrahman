"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Icon } from "./components";
import { flowCopy } from "./flow-copy";
import { computeSlots } from "./mock-engine";
import { findPackage, findService, findSpecialist } from "./mock-data";
import { RULES, addDays, riyadhParts, riyadhToday, weekdayOf } from "./rules";
import { siteAssets } from "./site-assets";
import { useLanguage } from "./site-ui";
import type {
  Booking,
  Db,
  EntitlementState,
  LocationId,
  PaymentStatus,
  SlotOption,
  SlotQuery,
  Specialist,
} from "./types";

/** Language-aware copy and Riyadh-time formatters for the flow screens. */
export function useFlow() {
  const { language, isArabic, text, toggleLanguage } = useLanguage();
  const t = flowCopy[language];
  const locale = isArabic ? "ar-SA-u-ca-gregory" : "en-US";
  const zone = RULES.timezone;

  return {
    language,
    isArabic,
    text,
    toggleLanguage,
    t,
    dir: (isArabic ? "rtl" : "ltr") as "rtl" | "ltr",
    formatDay: (iso: string) =>
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: zone,
      }).format(new Date(iso)),
    formatShortDay: (iso: string) =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: zone,
      }).format(new Date(iso)),
    formatTime: (iso: string) =>
      new Intl.DateTimeFormat(isArabic ? "ar-SA" : "en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: zone,
      }).format(new Date(iso)),
    formatDate: (iso: string) =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: zone,
      }).format(new Date(iso)),
    formatNumber: (value: number) => new Intl.NumberFormat(isArabic ? "ar-SA" : "en").format(value),
    money: (value: number) =>
      new Intl.NumberFormat(isArabic ? "ar-SA" : "en-SA", {
        style: "currency",
        currency: "SAR",
        maximumFractionDigits: 0,
      }).format(value),
  };
}

export type Flow = ReturnType<typeof useFlow>;

/** Current time, refreshed every 30 seconds so holds and "upcoming" lists stay accurate. */
export function useNow(interval = 30_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(timer);
  }, [interval]);

  return now;
}

export function productOf(booking: Pick<Booking, "serviceId" | "packageId">) {
  return findPackage(booking.packageId) ?? findService(booking.serviceId);
}

export function specialistName(id: string, language: "ar" | "en") {
  return findSpecialist(id)?.name[language] ?? "";
}

export function PageLoading() {
  const { t } = useFlow();

  return (
    <div className="flow-loading" role="status" aria-live="polite">
      <span className="flow-spinner" aria-hidden="true" />
      {t.loading}
    </div>
  );
}

export function FlowNotice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
}) {
  return (
    <p className={`flow-notice flow-notice-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon name={tone === "error" ? "lock" : "check"} />
      <span>{children}</span>
    </p>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <div className={`flow-field${error ? " has-error" : ""}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? (
        <small className="flow-field-error" id={`${htmlFor}-error`}>
          {error}
        </small>
      ) : (
        hint && <small id={`${htmlFor}-hint`}>{hint}</small>
      )}
    </div>
  );
}

const bookingStatusKey = {
  pending: "statusPending",
  confirmed: "statusConfirmed",
  completed: "statusCompleted",
  cancelled: "statusCancelled",
  no_show: "statusNoShow",
} as const;

export function StatusBadge({ status }: { status: Booking["status"] }) {
  const { t } = useFlow();
  return <span className={`status-badge status-${status}`}>{t[bookingStatusKey[status]]}</span>;
}

const paymentKey: Record<PaymentStatus, keyof typeof flowCopy.en> = {
  unpaid: "payUnpaid",
  pending: "payPending",
  paid: "payPaid",
  failed: "payFailed",
  refunded: "payRefunded",
  partially_refunded: "payPartial",
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const { t } = useFlow();
  return <span className={`status-badge pay-${status}`}>{t[paymentKey[status]] as string}</span>;
}

const stateKey: Record<EntitlementState, "stateActive" | "stateUsedUp" | "stateExpired" | "stateUnpaid"> = {
  active: "stateActive",
  used_up: "stateUsedUp",
  expired: "stateExpired",
  unpaid: "stateUnpaid",
};

export function EntitlementBadge({ state }: { state: EntitlementState }) {
  const { t } = useFlow();
  return <span className={`status-badge state-${state}`}>{t[stateKey[state]]}</span>;
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="booking-progress flow-stepper" aria-label="Progress">
      {steps.map((label, index) => {
        const state = index < current ? "complete" : index === current ? "current" : "";
        return (
          <li className={`progress-step ${state}`} key={label} aria-current={index === current ? "step" : undefined}>
            <span className="progress-number">
              {index < current ? <Icon name="check" /> : index + 1}
            </span>
            <span>{label}</span>
            {index < steps.length - 1 && <span className="progress-line" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

export function SpecialistAvatar({ specialist, size = 76 }: { specialist?: Specialist; size?: number }) {
  const src = specialist?.photo ? siteAssets.images[specialist.photo] : siteAssets.logoMark;

  return (
    <span className="specialist-photo specialist-logo" style={{ width: size, height: size }}>
      <Image src={src} alt="" width={164} height={112} />
    </span>
  );
}

type SlotPickerProps = {
  db: Db;
  query: Omit<SlotQuery, "date">;
  specialists: Specialist[];
  specialistId: string;
  startsAt: string;
  suggestedId?: string;
  onSpecialist: (id: string) => void;
  onSlot: (slot: SlotOption | null) => void;
};

/** Specialist cards, month calendar and the free times for the chosen day. */
export function SlotPicker({
  db,
  query,
  specialists,
  specialistId,
  startsAt,
  suggestedId,
  onSpecialist,
  onSlot,
}: SlotPickerProps) {
  const flow = useFlow();
  const { t, isArabic, language } = flow;
  const today = riyadhToday();
  const selectedDate = startsAt ? riyadhParts(startsAt).date : "";
  const [month, setMonth] = useState(() => (selectedDate || today).slice(0, 7));
  const [pickedDate, setPickedDate] = useState(selectedDate);
  const queryKey = JSON.stringify(query);

  const slotsFor = (date: string): SlotOption[] =>
    computeSlots(db, { ...query, date }).filter(
      (slot) => specialistId === "any" || slot.specialistIds.includes(specialistId),
    );

  const monthStart = `${month}-01`;
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  // The weekday header is Saturday-first.
  const offset = (weekdayOf(monthStart) + 1) % 7;
  const maxDate = addDays(today, RULES.maxDaysAhead);

  /* eslint-disable react-hooks/exhaustive-deps */
  const availability = useMemo(() => {
    const result = new Map<string, boolean>();
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${month}-${String(day).padStart(2, "0")}`;
      if (date < today || date > maxDate) continue;
      result.set(
        date,
        computeSlots(db, { ...query, date }).some(
          (slot) => specialistId === "any" || slot.specialistIds.includes(specialistId),
        ),
      );
    }
    return result;
  }, [db, queryKey, month, specialistId, today]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const daySlots = pickedDate ? slotsFor(pickedDate) : [];
  const monthLabel = new Intl.DateTimeFormat(isArabic ? "ar-SA-u-ca-gregory" : "en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
  const atFirstMonth = month <= today.slice(0, 7);
  const atLastMonth = month >= maxDate.slice(0, 7);

  function shiftMonth(amount: number) {
    const next = new Date(Date.UTC(year, monthNumber - 1 + amount, 1));
    setMonth(`${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`);
  }

  function pickDate(date: string) {
    setPickedDate(date);
    onSlot(null);
  }

  function pickSpecialist(id: string) {
    onSpecialist(id);
    onSlot(null);
  }

  const options: Array<{ id: string; label: string; hint?: string; specialist?: Specialist }> = [
    { id: "any", label: t.anySpecialist, hint: t.anySpecialistHint },
    ...specialists.map((specialist) => ({
      id: specialist.id,
      label: specialist.name[language],
      hint: specialist.id === suggestedId ? t.sameSpecialist : undefined,
      specialist,
    })),
  ];

  return (
    <>
      <fieldset className="booking-group">
        <legend>{t.specialistTitle}</legend>
        <div className="specialist-grid flow-specialist-grid">
          {options.map((option) => (
            <button
              className={`specialist-card${specialistId === option.id ? " selected" : ""}`}
              key={option.id}
              type="button"
              aria-pressed={specialistId === option.id}
              onClick={() => pickSpecialist(option.id)}
            >
              <SpecialistAvatar specialist={option.specialist} size={64} />
              <span className="specialist-name">{option.label}</span>
              {option.hint && <small>{option.hint}</small>}
              {specialistId === option.id && <Icon name="check" className="selected-mark" />}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="appointment-grid">
        <fieldset className="booking-group calendar-group">
          <legend>{t.chooseDate}</legend>
          <div className="calendar">
            <div className="calendar-toolbar">
              <button
                className="calendar-arrow"
                type="button"
                aria-label={t.previousMonth}
                disabled={atFirstMonth}
                onClick={() => shiftMonth(-1)}
              >
                <Icon name="arrow" />
              </button>
              <strong>{monthLabel}</strong>
              <button
                className="calendar-arrow next"
                type="button"
                aria-label={t.nextMonth}
                disabled={atLastMonth}
                onClick={() => shiftMonth(1)}
              >
                <Icon name="arrow" />
              </button>
            </div>
            <div className="calendar-grid">
              {t.weekdays.map((day) => (
                <span className="calendar-weekday" key={day}>
                  {day}
                </span>
              ))}
              {Array.from({ length: offset }, (_, index) => (
                <span className="calendar-empty" key={`empty-${index}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const date = `${month}-${String(day).padStart(2, "0")}`;
                const available = availability.get(date) === true;

                return (
                  <button
                    className={`calendar-day${pickedDate === date ? " selected" : ""}${available ? " has-slots" : ""}`}
                    key={date}
                    type="button"
                    disabled={!available}
                    aria-pressed={pickedDate === date}
                    onClick={() => pickDate(date)}
                  >
                    {new Intl.NumberFormat(isArabic ? "ar-SA" : "en", { useGrouping: false }).format(day)}
                  </button>
                );
              })}
            </div>
          </div>
        </fieldset>

        <fieldset className="booking-group time-group">
          <legend>{t.chooseTime}</legend>
          <div className="selected-date">
            <Icon name="calendar" />
            <span>
              {pickedDate ? flow.formatDay(`${pickedDate}T12:00:00+03:00`) : t.noDate}
            </span>
          </div>
          {!pickedDate ? (
            <p className="flow-muted">{t.pickDateFirst}</p>
          ) : daySlots.length === 0 ? (
            <p className="flow-muted">{specialistId === "any" ? t.noSlots : t.noSlotsForSpecialist}</p>
          ) : (
            <div className="time-options">
              {daySlots.map((slot) => (
                <button
                  className={`time-option${startsAt === slot.startsAt ? " selected" : ""}`}
                  key={slot.startsAt}
                  type="button"
                  aria-pressed={startsAt === slot.startsAt}
                  onClick={() => onSlot(slot)}
                >
                  {flow.formatTime(slot.startsAt)}
                </button>
              ))}
            </div>
          )}
          <p className="timezone-note">
            <Icon name="clock" />
            {t.timezone}
          </p>
        </fieldset>
      </div>
    </>
  );
}

export function cityLabel(id: LocationId, language: "ar" | "en") {
  return flowCityNames[id][language];
}

const flowCityNames: Record<LocationId, { ar: string; en: string }> = {
  khobar: { ar: "الخبر", en: "Khobar" },
  riyadh: { ar: "الرياض", en: "Riyadh" },
  jazan: { ar: "جازان", en: "Jazan" },
};
