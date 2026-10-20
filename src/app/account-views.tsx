"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { RequireAuth } from "./auth";
import { Icon } from "./components";
import {
  EntitlementBadge,
  Field,
  FlowNotice,
  PageLoading,
  PaymentBadge,
  SlotPicker,
  StatusBadge,
  cityLabel,
  productOf,
  specialistName,
  useFlow,
  useNow,
  type Flow,
} from "./flow-ui";
import { fill } from "./flow-copy";
import {
  canChangeBooking,
  customerBookings,
  customerEntitlements,
  deleteAddress,
  eligibleSpecialists,
  entitlementBookings,
  entitlementState,
  logout,
  payBooking,
  rescheduleBooking,
  saveAddress,
  updateProfile,
  useDb,
} from "./mock-engine";
import { findPackage, findSpecialist, locations } from "./mock-data";
import { RULES, isMapLink, parseMapLink, sessionsLeft } from "./rules";
import { addOnLabels } from "./site-data";
import { useBranch } from "./site-ui";
import { EngineError, type Address, type Booking, type Customer, type Entitlement, type LocationId } from "./types";

const WHATSAPP = "https://wa.me/966554508557";

function AccountPage({ children }: { children: (customer: Customer) => ReactNode }) {
  return <RequireAuth fallback={<PageLoading />}>{children}</RequireAuth>;
}

function AccountNav({ active }: { active: "bookings" | "packages" | "profile" | "addresses" }) {
  const branch = useBranch();
  const { t } = useFlow();
  const items = [
    ["bookings", t.myBookings],
    ["packages", t.myPackages],
    ["addresses", t.myAddresses],
    ["profile", t.myProfile],
  ] as const;

  return (
    <nav className="account-nav" aria-label={t.accountNav}>
      {items.map(([key, label]) => (
        <Link
          key={key}
          className={`account-nav-link${active === key ? " active" : ""}`}
          href={`/${branch}/account/${key === "profile" ? "profile" : key}`}
          aria-current={active === key ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

function PageHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="page-heading account-heading">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

function sessionNumber(db: ReturnType<typeof useDb>["db"], booking: Booking) {
  if (!booking.entitlementId) return null;
  const ordered = entitlementBookings(db, booking.entitlementId).filter((item) => item.status !== "cancelled");
  const index = ordered.findIndex((item) => item.id === booking.id);
  const entitlement = db.entitlements.find((item) => item.id === booking.entitlementId);
  return index >= 0 && entitlement ? { index: index + 1, total: entitlement.sessionsTotal } : null;
}

function BookingCard({ booking, db, flow }: { booking: Booking; db: ReturnType<typeof useDb>["db"]; flow: Flow }) {
  const branch = useBranch();
  const { t, language } = flow;
  const product = productOf(booking);
  const session = sessionNumber(db, booking);

  return (
    <li className="booking-card">
      <div className="booking-card-main">
        <div className="booking-card-top">
          <strong>{product?.name[language]}</strong>
          <StatusBadge status={booking.status} />
        </div>
        <p className="booking-card-when">
          <Icon name="calendar" />
          {flow.formatDay(booking.startsAt)} · {flow.formatTime(booking.startsAt)}
        </p>
        <p className="booking-card-meta">
          {specialistName(booking.specialistId, language)} · {booking.address.district}
          {session && ` · ${fill(t.sessionOf, { i: flow.formatNumber(session.index), n: flow.formatNumber(session.total) })}`}
        </p>
        <p className="booking-card-ref">
          <bdi dir="ltr">{booking.ref}</bdi>
        </p>
      </div>
      <Link className="button button-outline booking-card-cta" href={`/${branch}/account/bookings/${booking.id}`}>
        {t.viewDetails}
        <Icon name="arrow" />
      </Link>
    </li>
  );
}

export function BookingsView() {
  return <AccountPage>{(customer) => <BookingsInner customer={customer} />}</AccountPage>;
}

function BookingsInner({ customer }: { customer: Customer }) {
  const branch = useBranch();
  const flow = useFlow();
  const { t, dir } = flow;
  const { db } = useDb();
  const [tab, setTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const all = customerBookings(db, customer.id);
  const now = useNow();
  const lists = {
    upcoming: all
      .filter((item) => (item.status === "pending" || item.status === "confirmed") && new Date(item.endsAt).getTime() >= now)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    past: all
      .filter(
        (item) =>
          item.status === "completed" ||
          item.status === "no_show" ||
          ((item.status === "confirmed" || item.status === "pending") && new Date(item.endsAt).getTime() < now),
      )
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
    cancelled: all.filter((item) => item.status === "cancelled").sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
  };
  const empty = { upcoming: t.emptyUpcoming, past: t.emptyPast, cancelled: t.emptyCancelled };
  const tabs = [
    ["upcoming", t.tabUpcoming],
    ["past", t.tabPast],
    ["cancelled", t.tabCancelled],
  ] as const;

  return (
    <section className="page-section account-screen" dir={dir}>
      <PageHead title={t.bookingsTitle} subtitle={t.bookingsSubtitle} />
      <AccountNav active="bookings" />

      <div className="service-tabs journey-tabs account-tabs" role="tablist">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            className={`service-tab${tab === key ? " active" : ""}`}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
          >
            {label} ({flow.formatNumber(lists[key].length)})
          </button>
        ))}
      </div>

      {lists[tab].length === 0 ? (
        <div className="empty-state">
          <p>{empty[tab]}</p>
          <Link className="button button-primary flow-inline-button" href={`/${branch}/services`}>
            {t.bookNew}
            <Icon name="arrow" />
          </Link>
        </div>
      ) : (
        <ul className="booking-card-list">
          {lists[tab].map((booking) => (
            <BookingCard key={booking.id} booking={booking} db={db} flow={flow} />
          ))}
        </ul>
      )}
    </section>
  );
}

const historyKey: Record<string, "historyCreated" | "historyPaid" | "historyCompleted" | "historyNoShow" | "historyCancelled" | "historyRescheduled" | "historyRefunded"> = {
  created: "historyCreated",
  paid: "historyPaid",
  completed: "historyCompleted",
  no_show: "historyNoShow",
  cancelled: "historyCancelled",
  rescheduled: "historyRescheduled",
  refunded: "historyRefunded",
};

function HistoryList({ booking, flow }: { booking: Booking; flow: Flow }) {
  const { t } = flow;
  const entries = booking.history.filter((entry) => historyKey[entry.action]);

  return (
    <ol className="history-list">
      {[...entries].reverse().map((entry, index) => (
        <li key={`${entry.at}-${index}`}>
          <strong>{t[historyKey[entry.action]]}</strong>
          <span>
            {flow.formatDate(entry.at)} · {flow.formatTime(entry.at)}
          </span>
          {entry.note && entry.action !== "created" && entry.action !== "paid" && <small>{entry.note}</small>}
        </li>
      ))}
    </ol>
  );
}

export function BookingDetailView() {
  return <AccountPage>{(customer) => <BookingDetailInner customer={customer} />}</AccountPage>;
}

function BookingDetailInner({ customer }: { customer: Customer }) {
  const params = useParams<{ id: string }>();
  const branch = useBranch();
  const flow = useFlow();
  const { t, language, dir } = flow;
  const { db } = useDb();
  const now = useNow();
  const booking = db.bookings.find((item) => item.id === params.id && item.customerId === customer.id);
  const [mode, setMode] = useState<"view" | "reschedule">("view");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [specialist, setSpecialist] = useState("any");

  if (!booking) {
    return (
      <section className="page-section account-screen" dir={dir}>
        <FlowNotice tone="error">{t.bookingNotFound}</FlowNotice>
        <Link className="button button-outline flow-inline-button" href={`/${branch}/account/bookings`}>
          {t.backToBookings}
        </Link>
      </section>
    );
  }

  const product = productOf(booking);
  const pkg = findPackage(booking.packageId);
  const entitlement = db.entitlements.find((item) => item.id === booking.entitlementId);
  const session = sessionNumber(db, booking);
  const open = booking.status === "pending" || booking.status === "confirmed";
  const changeable = open && canChangeBooking(booking, now);
  const holdMinutes =
    booking.status === "pending"
      ? Math.max(0, Math.ceil(RULES.slotHoldMinutes - (now - new Date(booking.createdAt).getTime()) / 60_000))
      : 0;
  const serviceId = pkg ? pkg.serviceId : booking.serviceId;

  function describe(failure: unknown) {
    if (failure instanceof EngineError) {
      if (failure.code === "SLOT_UNAVAILABLE") return failure.detail === "specialist_busy" ? t.specialistBusy : t.slotTaken;
      if (failure.code === "PACKAGE_EXPIRED") return t.packageExpired;
      if (failure.code === "CONFLICT" && failure.detail === "within_window") return t.withinWindow;
      if (failure.code === "VALIDATION_FAILED") return t.errReason;
    }
    return t.genericError;
  }

  async function confirmReschedule() {
    if (!booking || !slotStart) return;
    setError("");
    setBusy(true);
    try {
      await rescheduleBooking(customer.id, booking.id, { startsAt: slotStart, specialistId: specialist, reason });
      setMode("view");
      setReason("");
      setSlotStart("");
      setMessage(t.rescheduledOk);
    } catch (failure) {
      setError(describe(failure));
    } finally {
      setBusy(false);
    }
  }

  async function payHeld() {
    if (!booking) return;
    setBusy(true);
    setError("");
    try {
      await payBooking(customer.id, booking.id, "online");
    } catch (failure) {
      setError(describe(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section account-screen" dir={dir}>
      <Link className="text-link back-link" href={`/${branch}/account/bookings`}>
        {t.backToBookings}
      </Link>
      <div className="page-heading account-heading">
        <h1>
          {t.bookingDetailTitle} <bdi dir="ltr">{booking.ref}</bdi>
        </h1>
        <div className="badge-row">
          <StatusBadge status={booking.status} />
          <PaymentBadge status={booking.paymentStatus} />
          {session && (
            <span className="status-badge state-active">
              {fill(t.sessionOf, { i: flow.formatNumber(session.index), n: flow.formatNumber(session.total) })}
            </span>
          )}
        </div>
      </div>

      {message && <FlowNotice tone="success">{message}</FlowNotice>}
      {error && <FlowNotice tone="error">{error}</FlowNotice>}
      {booking.status === "pending" && (
        <FlowNotice>
          {holdMinutes > 0 ? fill(t.holdLeft, { m: holdMinutes }) : t.holdExpired}
        </FlowNotice>
      )}

      <div className="detail-grid">
        <dl className="detail-list">
          <div>
            <dt>{t.detailWhen}</dt>
            <dd>
              {flow.formatDay(booking.startsAt)}
              <br />
              {flow.formatTime(booking.startsAt)} – {flow.formatTime(booking.endsAt)}
            </dd>
          </div>
          <div>
            <dt>{pkg ? t.detailPackage : t.detailService}</dt>
            <dd>{(pkg ?? product)?.name[language]}</dd>
          </div>
          <div>
            <dt>{t.detailSpecialist}</dt>
            <dd>{specialistName(booking.specialistId, language)}</dd>
          </div>
          <div>
            <dt>{t.detailAddress}</dt>
            <dd>
              {cityLabel(booking.locationId, language)} — {[booking.address.district, booking.address.street, booking.address.building].filter(Boolean).join("، ")}
              {booking.address.notes && (
                <>
                  <br />
                  {booking.address.notes}
                </>
              )}
            </dd>
          </div>
          {booking.guests > 1 && (
            <div>
              <dt>{t.detailGuests}</dt>
              <dd>{flow.formatNumber(booking.guests)}</dd>
            </div>
          )}
          <div>
            <dt>{t.detailPrice}</dt>
            <dd>{booking.entitlementId ? t.coveredByPackage : flow.money(booking.price)}</dd>
          </div>
          {booking.addOns && booking.addOns.length > 0 && (
            <div>
              <dt>{t.detailAddOns}</dt>
              <dd>{addOnLabels(booking.addOns, language)}</dd>
            </div>
          )}
          {booking.notes && (
            <div>
              <dt>{t.detailNotes}</dt>
              <dd>{booking.notes}</dd>
            </div>
          )}
        </dl>

        <div className="detail-side">
          <h2>{t.history}</h2>
          <HistoryList booking={booking} flow={flow} />
          {entitlement && (
            <Link className="text-link" href={`/${branch}/account/packages/${entitlement.id}`}>
              {t.viewPackage}
            </Link>
          )}
        </div>
      </div>

      {open && mode === "view" && (
        <div className="flow-actions detail-actions">
          {booking.status === "pending" && booking.paymentStatus !== "paid" && holdMinutes > 0 && (
            <button className="button button-primary" type="button" onClick={payHeld} disabled={busy}>
              {busy ? t.processing : t.payNowHeld}
              <Icon name="arrow" />
            </button>
          )}
          {changeable && (
            <button className="button button-outline" type="button" onClick={() => setMode("reschedule")}>
              {t.rescheduleBooking}
            </button>
          )}
          {!changeable && booking.status === "confirmed" && (
            <p className="flow-muted">
              {t.withinWindow}{" "}
              <a className="text-link" href={WHATSAPP} target="_blank" rel="noreferrer">
                {t.contactWhatsapp}
              </a>
            </p>
          )}
          {changeable && booking.status === "confirmed" && <p className="flow-muted">{t.freeChangeNote}</p>}
        </div>
      )}

      {mode === "reschedule" && (
        <div className="flow-panel">
          <SlotPicker
            db={db}
            query={{
              locationId: booking.locationId,
              serviceId: pkg ? undefined : booking.serviceId,
              packageId: pkg?.id,
              guests: booking.guests,
              excludeBookingId: booking.id,
            }}
            specialists={eligibleSpecialists(booking.locationId, serviceId)}
            specialistId={specialist}
            startsAt={slotStart}
            suggestedId={booking.specialistId}
            onSpecialist={setSpecialist}
            onSlot={(slot) => setSlotStart(slot?.startsAt ?? "")}
          />
          <Field label={t.rescheduleReasonLabel} htmlFor="resched-reason">
            <input
              id="resched-reason"
              value={reason}
              placeholder={t.rescheduleReasonPlaceholder}
              onChange={(event) => setReason(event.target.value)}
            />
          </Field>
          <div className="flow-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={confirmReschedule}
              disabled={busy || !slotStart || !reason.trim()}
            >
              {busy ? t.rescheduling : t.rescheduleConfirm}
              <Icon name="arrow" />
            </button>
            <button className="text-link" type="button" onClick={() => setMode("view")}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {(booking.status === "completed" || booking.status === "cancelled" || booking.status === "no_show") && product && (
        <div className="flow-actions detail-actions">
          <Link
            className="button button-primary"
            href={`/${branch}/${pkg ? "packages" : "services"}/${product.id}`}
          >
            {t.rebook}
            <Icon name="arrow" />
          </Link>
        </div>
      )}
    </section>
  );
}

function EntitlementCard({ entitlement, flow }: { entitlement: Entitlement; flow: Flow }) {
  const branch = useBranch();
  const { t, language } = flow;
  const pkg = findPackage(entitlement.packageId);
  const state = entitlementState(entitlement);
  const left = sessionsLeft(entitlement);
  const total = entitlement.sessionsTotal;
  const percent = Math.round(((entitlement.sessionsUsed + entitlement.sessionsReserved) / total) * 100);

  return (
    <li className="package-card">
      <div className="booking-card-top">
        <strong>{pkg?.name[language]}</strong>
        <EntitlementBadge state={state} />
      </div>
      <p className="booking-card-meta">
        <bdi dir="ltr">{entitlement.ref}</bdi> · {cityLabel(entitlement.locationId, language)}
      </p>
      <div className="progress-bar" role="img" aria-label={`${entitlement.sessionsUsed}/${total}`}>
        <span style={{ width: `${percent}%` }} />
      </div>
      <p className="booking-card-meta">
        {fill(t.sessionsSummary, {
          left: flow.formatNumber(left),
          total: flow.formatNumber(total),
          used: flow.formatNumber(entitlement.sessionsUsed),
          booked: flow.formatNumber(entitlement.sessionsReserved),
        })}
      </p>
      <p className="booking-card-meta">
        {t.validUntil} {flow.formatDate(entitlement.expiresAt)}
      </p>
      <div className="flow-actions">
        <Link className="button button-outline" href={`/${branch}/account/packages/${entitlement.id}`}>
          {t.viewDetails}
          <Icon name="arrow" />
        </Link>
        {state === "active" && left > 0 && pkg && (
          <Link className="button button-primary" href={`/${branch}/book/${pkg.id}?package=${entitlement.id}`}>
            {t.bookNextSession}
            <Icon name="arrow" />
          </Link>
        )}
      </div>
    </li>
  );
}

export function PackagesView() {
  return <AccountPage>{(customer) => <PackagesInner customer={customer} />}</AccountPage>;
}

function PackagesInner({ customer }: { customer: Customer }) {
  const branch = useBranch();
  const flow = useFlow();
  const { t, dir } = flow;
  const { db } = useDb();
  const list = customerEntitlements(db, customer.id);

  return (
    <section className="page-section account-screen" dir={dir}>
      <PageHead title={t.packagesTitle} subtitle={t.packagesSubtitle} />
      <AccountNav active="packages" />
      {list.length === 0 ? (
        <div className="empty-state">
          <p>{t.emptyPackages}</p>
          <Link className="button button-primary flow-inline-button" href={`/${branch}/packages`}>
            {t.browsePackages}
            <Icon name="arrow" />
          </Link>
        </div>
      ) : (
        <ul className="booking-card-list package-card-list">
          {list.map((entitlement) => (
            <EntitlementCard key={entitlement.id} entitlement={entitlement} flow={flow} />
          ))}
        </ul>
      )}
    </section>
  );
}

const ledgerKey = {
  purchased: "ledgerPurchased",
  reserved: "ledgerReserved",
  used: "ledgerUsed",
  released: "ledgerReleased",
  adjusted: "ledgerAdjusted",
} as const;

export function PackageDetailView() {
  return <AccountPage>{(customer) => <PackageDetailInner customer={customer} />}</AccountPage>;
}

function PackageDetailInner({ customer }: { customer: Customer }) {
  const params = useParams<{ id: string }>();
  const branch = useBranch();
  const flow = useFlow();
  const { t, language, dir } = flow;
  const { db } = useDb();
  const entitlement = db.entitlements.find((item) => item.id === params.id && item.customerId === customer.id);

  if (!entitlement) {
    return (
      <section className="page-section account-screen" dir={dir}>
        <FlowNotice tone="error">{t.packageNotFound}</FlowNotice>
        <Link className="button button-outline flow-inline-button" href={`/${branch}/account/packages`}>
          {t.backToPackages}
        </Link>
      </section>
    );
  }

  const pkg = findPackage(entitlement.packageId);
  const state = entitlementState(entitlement);
  const left = sessionsLeft(entitlement);
  const sessions = entitlementBookings(db, entitlement.id).filter((item) => item.status !== "cancelled");
  const emptySlots = Math.max(0, entitlement.sessionsTotal - sessions.length);

  return (
    <section className="page-section account-screen" dir={dir}>
      <Link className="text-link back-link" href={`/${branch}/account/packages`}>
        {t.backToPackages}
      </Link>
      <div className="page-heading account-heading">
        <h1>{pkg?.name[language]}</h1>
        <div className="badge-row">
          <EntitlementBadge state={state} />
          <span className="status-badge">
            <bdi dir="ltr">{entitlement.ref}</bdi>
          </span>
        </div>
      </div>

      <div className="detail-grid">
        <dl className="detail-list">
          <div>
            <dt>{t.sessionsLabel}</dt>
            <dd>
              {fill(t.sessionsSummary, {
                left: flow.formatNumber(left),
                total: flow.formatNumber(entitlement.sessionsTotal),
                used: flow.formatNumber(entitlement.sessionsUsed),
                booked: flow.formatNumber(entitlement.sessionsReserved),
              })}
            </dd>
          </div>
          <div>
            <dt>{t.purchasedOn}</dt>
            <dd>{flow.formatDate(entitlement.purchasedAt)}</dd>
          </div>
          <div>
            <dt>{t.validUntil}</dt>
            <dd>{flow.formatDate(entitlement.expiresAt)}</dd>
          </div>
          <div>
            <dt>{t.packagePrice}</dt>
            <dd>
              {flow.money(entitlement.price)} <PaymentBadge status={entitlement.paymentStatus} />
            </dd>
          </div>
          <div>
            <dt>{t.summaryCity}</dt>
            <dd>{cityLabel(entitlement.locationId, language)}</dd>
          </div>
        </dl>

        <div className="detail-side">
          {state === "expired" && <FlowNotice tone="error">{t.expiredNote}</FlowNotice>}
          {state === "used_up" && <FlowNotice>{t.usedUpNote}</FlowNotice>}
          {state === "active" && left > 0 && pkg && (
            <Link className="button button-primary" href={`/${branch}/book/${pkg.id}?package=${entitlement.id}`}>
              {t.bookNextSession}
              <Icon name="arrow" />
            </Link>
          )}
        </div>
      </div>

      <h2 className="account-subtitle">{t.sessionsTimeline}</h2>
      <ol className="session-timeline">
        {sessions.map((booking, index) => (
          <li key={booking.id}>
            <span className="session-index">{flow.formatNumber(index + 1)}</span>
            <div>
              <strong>{fill(t.sessionOf, { i: flow.formatNumber(index + 1), n: flow.formatNumber(entitlement.sessionsTotal) })}</strong>
              <span>
                {flow.formatDay(booking.startsAt)} · {flow.formatTime(booking.startsAt)}
              </span>
              <small>{specialistName(booking.specialistId, language)}</small>
            </div>
            <StatusBadge status={booking.status} />
            <Link className="text-link" href={`/${branch}/account/bookings/${booking.id}`}>
              {t.viewDetails}
            </Link>
          </li>
        ))}
        {Array.from({ length: emptySlots }, (_, index) => (
          <li className="session-free" key={`free-${index}`}>
            <span className="session-index">{flow.formatNumber(sessions.length + index + 1)}</span>
            <div>
              <strong>{fill(t.sessionOf, { i: flow.formatNumber(sessions.length + index + 1), n: flow.formatNumber(entitlement.sessionsTotal) })}</strong>
              <span>{t.sessionRowFree}</span>
            </div>
            {state === "active" && pkg && index === 0 && (
              <Link className="button button-primary session-book" href={`/${branch}/book/${pkg.id}?package=${entitlement.id}`}>
                {t.sessionBookNow}
              </Link>
            )}
          </li>
        ))}
      </ol>

      <h2 className="account-subtitle">{t.ledgerTitle}</h2>
      <ol className="history-list">
        {[...entitlement.ledger].reverse().map((entry) => (
          <li key={entry.id}>
            <strong>{t[ledgerKey[entry.type]]}</strong>
            <span>
              {flow.formatDate(entry.at)} · {entry.reason}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ProfileView() {
  return <AccountPage>{(customer) => <ProfileInner customer={customer} />}</AccountPage>;
}

function ProfileInner({ customer }: { customer: Customer }) {
  const branch = useBranch();
  const router = useRouter();
  const flow = useFlow();
  const { t, dir, toggleLanguage, text } = flow;
  const { db } = useDb();
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const completed = db.bookings.filter((item) => item.customerId === customer.id && item.status === "completed").length;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setBusy(true);
    try {
      await updateProfile(customer.id, { name, email });
      setSaved(true);
    } catch (failure) {
      setError(
        failure instanceof EngineError && failure.detail === "email"
          ? t.errEmail
          : failure instanceof EngineError && failure.detail === "name"
            ? t.errName
            : t.genericError,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section account-screen" dir={dir}>
      <PageHead title={t.profileTitle} subtitle={t.profileSubtitle} />
      <AccountNav active="profile" />

      <div className="detail-grid">
        <form className="flow-panel" onSubmit={submit} noValidate>
          <Field label={t.nameLabel} htmlFor="profile-name">
            <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          </Field>
          <Field label={`${t.emailLabel} (${t.optional})`} htmlFor="profile-email">
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              dir="ltr"
            />
          </Field>
          <Field label={t.profilePhone} htmlFor="profile-phone">
            <input id="profile-phone" value={customer.phone} readOnly dir="ltr" />
          </Field>
          {error && <FlowNotice tone="error">{error}</FlowNotice>}
          {saved && <FlowNotice tone="success">{t.profileSaved}</FlowNotice>}
          <div className="flow-actions">
            <button className="button button-primary" type="submit" disabled={busy}>
              {busy ? t.processing : t.save}
              <Icon name="check" />
            </button>
          </div>
        </form>

        <div className="detail-side">
          <dl className="detail-list">
            <div>
              <dt>{t.profileMemberSince}</dt>
              <dd>{flow.formatDate(customer.createdAt)}</dd>
            </div>
            <div>
              <dt>{t.profileVisits}</dt>
              <dd>{flow.formatNumber(completed)}</dd>
            </div>
            <div>
              <dt>{t.profileLanguage}</dt>
              <dd>
                <button className="text-link" type="button" onClick={toggleLanguage}>
                  {text.language}
                </button>
              </dd>
            </div>
          </dl>
          <button
            className="button button-outline danger"
            type="button"
            onClick={() => {
              logout();
              router.replace(`/${branch}`);
            }}
          >
            {t.signOut}
          </button>
        </div>
      </div>
    </section>
  );
}

export function AddressesView() {
  return <AccountPage>{(customer) => <AddressesInner customer={customer} />}</AccountPage>;
}

const blankAddress = { id: "", label: "", district: "", street: "", building: "", notes: "", mapLink: "", locationId: "riyadh" as LocationId };

function AddressesInner({ customer }: { customer: Customer }) {
  const branch = useBranch() as LocationId;
  const flow = useFlow();
  const { t, language, dir } = flow;
  const [editing, setEditing] = useState<typeof blankAddress | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function startEdit(address?: Address) {
    setError("");
    setMessage("");
    setEditing(
      address
        ? {
            id: address.id,
            label: address.label,
            district: address.district,
            street: address.street,
            building: address.building,
            notes: address.notes ?? "",
            mapLink: address.mapLink ?? (address.lat !== undefined ? `${address.lat}, ${address.lng}` : ""),
            locationId: address.locationId,
          }
        : { ...blankAddress, locationId: branch },
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setError("");
    if (!editing.district.trim()) return setError(t.errDistrict);
    if (!editing.street.trim()) return setError(t.errStreet);
    if (!editing.mapLink.trim()) return setError(t.errMapLink);
    if (!isMapLink(editing.mapLink)) return setError(t.errMapLinkInvalid);
    const point = parseMapLink(editing.mapLink);
    setBusy(true);
    try {
      await saveAddress(customer.id, {
        id: editing.id || undefined,
        label: editing.label.trim() || (language === "ar" ? "المنزل" : "Home"),
        district: editing.district.trim(),
        street: editing.street.trim(),
        building: editing.building.trim(),
        notes: editing.notes.trim() || undefined,
        lat: point?.lat,
        lng: point?.lng,
        mapLink: editing.mapLink.trim(),
        locationId: editing.locationId,
      });
      setEditing(null);
      setMessage(t.addressSaved);
    } catch (failure) {
      setError(failure instanceof EngineError && failure.code === "OUT_OF_COVERAGE" ? t.outOfCoverage : t.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function remove(address: Address) {
    setBusy(true);
    await deleteAddress(customer.id, address.id);
    setBusy(false);
    setMessage(t.addressDeleted);
  }

  const set = (patch: Partial<typeof blankAddress>) => setEditing((current) => (current ? { ...current, ...patch } : current));

  return (
    <section className="page-section account-screen" dir={dir}>
      <PageHead title={t.addressesTitle} subtitle={t.addressesSubtitle} />
      <AccountNav active="addresses" />
      {message && <FlowNotice tone="success">{message}</FlowNotice>}

      {customer.addresses.length === 0 && !editing && (
        <div className="empty-state">
          <p>{t.emptyAddresses}</p>
        </div>
      )}

      <ul className="booking-card-list address-manage-list">
        {customer.addresses.map((address) => (
          <li className="booking-card" key={address.id}>
            <div className="booking-card-main">
              <div className="booking-card-top">
                <strong>{address.label}</strong>
                <span className="status-badge">{cityLabel(address.locationId, language)}</span>
              </div>
              <p className="booking-card-meta">
                {[address.district, address.street, address.building].filter(Boolean).join("، ")}
              </p>
              {address.notes && <p className="booking-card-meta">{address.notes}</p>}
            </div>
            <div className="flow-actions">
              <button className="button button-outline" type="button" onClick={() => startEdit(address)}>
                {t.edit}
              </button>
              <button className="button button-outline danger" type="button" onClick={() => remove(address)} disabled={busy}>
                {t.remove}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!editing && (
        <div className="flow-actions">
          <button className="button button-primary" type="button" onClick={() => startEdit()}>
            {t.addAddress}
            <Icon name="location" />
          </button>
        </div>
      )}

      {editing && (
        <form className="flow-panel flow-form-grid" onSubmit={submit} noValidate>
          <h3>{editing.id ? t.edit : t.addAddress}</h3>
          <Field label={t.city} htmlFor="ea-city">
            <select id="ea-city" value={editing.locationId} onChange={(event) => set({ locationId: event.target.value as LocationId })}>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name[language]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.addressLabel} htmlFor="ea-label">
            <input id="ea-label" value={editing.label} placeholder={t.addressLabelPlaceholder} onChange={(event) => set({ label: event.target.value })} />
          </Field>
          <Field label={t.district} htmlFor="ea-district">
            <input id="ea-district" value={editing.district} onChange={(event) => set({ district: event.target.value })} />
          </Field>
          <Field label={t.street} htmlFor="ea-street">
            <input id="ea-street" value={editing.street} onChange={(event) => set({ street: event.target.value })} />
          </Field>
          <Field label={t.building} htmlFor="ea-building">
            <input id="ea-building" value={editing.building} onChange={(event) => set({ building: event.target.value })} />
          </Field>
          <Field label={t.addressNotes} htmlFor="ea-notes">
            <input id="ea-notes" value={editing.notes} placeholder={t.addressNotesPlaceholder} onChange={(event) => set({ notes: event.target.value })} />
          </Field>
          <Field label={t.mapLink} hint={t.mapLinkHint} htmlFor="ea-map">
            <input id="ea-map" value={editing.mapLink} onChange={(event) => set({ mapLink: event.target.value })} dir="ltr" />
          </Field>
          {error && <FlowNotice tone="error">{error}</FlowNotice>}
          <div className="flow-actions">
            <button className="button button-primary" type="submit" disabled={busy}>
              {busy ? t.savingAddress : t.saveAddress}
              <Icon name="check" />
            </button>
            <button className="text-link" type="button" onClick={() => setEditing(null)}>
              {t.cancel}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export function ConfirmationView() {
  return <AccountPage>{(customer) => <ConfirmationInner customer={customer} />}</AccountPage>;
}

function buildIcs(booking: Booking, title: string, location: string) {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AlJoudi Wellness Spa//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@aljoudi-spa`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(booking.startsAt)}`,
    `DTEND:${stamp(booking.endsAt)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${booking.ref}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function ConfirmationInner({ customer }: { customer: Customer }) {
  const params = useParams<{ id: string }>();
  const branch = useBranch();
  const flow = useFlow();
  const { t, language, dir } = flow;
  const { db } = useDb();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const booking = db.bookings.find((item) => item.id === params.id && item.customerId === customer.id);

  if (!booking) notFound();

  const product = productOf(booking);
  const pkg = findPackage(booking.packageId);
  const entitlement = db.entitlements.find((item) => item.id === booking.entitlementId);
  const session = sessionNumber(db, booking);
  const held = booking.status === "pending";
  const cancelled = booking.status === "cancelled";
  const specialist = findSpecialist(booking.specialistId);
  const name = (pkg ?? product)?.name[language] ?? "";

  function downloadIcs() {
    const file = new Blob([buildIcs(booking!, name, booking!.address.district)], { type: "text/calendar" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${booking!.ref}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function payNow() {
    setBusy(true);
    setError("");
    try {
      await payBooking(customer.id, booking!.id, "online");
    } catch {
      setError(t.paymentDeclined);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section confirmation-screen" dir={dir}>
      <div className="confirmation-card">
        <span className={`confirmation-mark${held || cancelled ? " held" : ""}`} aria-hidden="true">
          <Icon name={held || cancelled ? "clock" : "check"} />
        </span>
        <h1>{cancelled ? t.statusCancelled : held ? t.heldTitle : t.confirmedTitle}</h1>
        <p className="auth-lead">
          {cancelled
            ? t.holdExpired
            : held
              ? fill(t.heldSubtitle, { n: RULES.slotHoldMinutes })
              : t.confirmedSubtitle}
        </p>
        <p className="confirmation-ref">
          {t.referenceLabel}: <bdi dir="ltr">{booking.ref}</bdi>
        </p>

        <dl className="detail-list">
          <div>
            <dt>{pkg ? t.detailPackage : t.detailService}</dt>
            <dd>{name}</dd>
          </div>
          <div>
            <dt>{t.detailWhen}</dt>
            <dd>
              {flow.formatDay(booking.startsAt)} · {flow.formatTime(booking.startsAt)}
            </dd>
          </div>
          <div>
            <dt>{t.detailSpecialist}</dt>
            <dd>{specialist?.name[language]}</dd>
          </div>
          <div>
            <dt>{t.detailAddress}</dt>
            <dd>{[booking.address.district, booking.address.street, booking.address.building].filter(Boolean).join("، ")}</dd>
          </div>
          {session && entitlement && (
            <div>
              <dt>{t.sessionsLabel}</dt>
              <dd>{fill(t.sessionOf, { i: flow.formatNumber(session.index), n: flow.formatNumber(session.total) })}</dd>
            </div>
          )}
          {booking.addOns && booking.addOns.length > 0 && (
            <div>
              <dt>{t.detailAddOns}</dt>
              <dd>{addOnLabels(booking.addOns, language)}</dd>
            </div>
          )}
          <div>
            <dt>{t.detailPrice}</dt>
            <dd>{entitlement ? (entitlement.price > 0 && session?.index === 1 ? flow.money(entitlement.price) : t.coveredByPackage) : flow.money(booking.price)}</dd>
          </div>
        </dl>

        {error && <FlowNotice tone="error">{error}</FlowNotice>}

        <div className="flow-actions confirmation-actions">
          {held && (
            <button className="button button-primary" type="button" onClick={payNow} disabled={busy}>
              {busy ? t.processing : t.payNowHeld}
              <Icon name="arrow" />
            </button>
          )}
          {!held && !cancelled && (
            <button className="button button-outline" type="button" onClick={downloadIcs}>
              {t.addToCalendar}
              <Icon name="calendar" />
            </button>
          )}
          {entitlement ? (
            <Link className="button button-outline" href={`/${branch}/account/packages/${entitlement.id}`}>
              {t.viewPackage}
            </Link>
          ) : null}
          <Link className="button button-outline" href={`/${branch}/account/bookings`}>
            {t.viewBookings}
          </Link>
        </div>
        <p className="flow-muted">
          <a className="text-link" href={WHATSAPP} target="_blank" rel="noreferrer">
            {t.contactWhatsapp}
          </a>
        </p>
      </div>
    </section>
  );
}

