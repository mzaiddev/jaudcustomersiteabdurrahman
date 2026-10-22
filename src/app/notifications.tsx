"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./auth";
import { Icon } from "./components";
import { fill } from "./flow-copy";
import { useFlow, useNow } from "./flow-ui";
import { findPackage, findService } from "./mock-data";
import { markNotificationsRead, useDb } from "./mock-engine";
import { RULES } from "./rules";
import type { IconName } from "./site-data";
import type { AppNotification, Booking, Db } from "./types";

export const WHATSAPP_URL = "https://wa.me/966554508557";

type Flow = ReturnType<typeof useFlow>;
type Tone = "warn" | "ok" | "info";
type Action = { label: string; href: string; external?: boolean; primary?: boolean };
type Content = { title: string; body: string; icon: IconName; tone: Tone; actions: Action[] };

/** The signed-in customer's notifications, newest first. */
export function useNotifications(customerId: string | undefined) {
  const { db } = useDb();
  const items = (db.notifications ?? [])
    .filter((item) => item.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unread = items.filter((item) => !item.readAt).length;
  return { db, items, unread };
}

function productName(booking: Booking | undefined, language: "ar" | "en") {
  if (!booking) return "";
  return (findPackage(booking.packageId) ?? findService(booking.serviceId))?.name[language] ?? "";
}

/** Builds the words and buttons for a notification from its kind and booking, in the current language. */
function contentFor(item: AppNotification, db: Db, flow: Flow, now: number): Content {
  const { t, language } = flow;
  const booking = item.bookingId ? db.bookings.find((entry) => entry.id === item.bookingId) : undefined;
  const name = productName(booking, language);
  const when = booking ? `${flow.formatDay(booking.startsAt)} · ${flow.formatTime(booking.startsAt)}` : "";
  const isOpen = booking?.status === "confirmed" || booking?.status === "pending";
  const base = booking ? `/${booking.locationId}/account/bookings` : "";
  const view: Action[] = booking && isOpen ? [{ label: t.notifViewBooking, href: `${base}/${booking.id}` }] : [];

  switch (item.kind) {
    case "reminder": {
      if (!booking) break;
      const hoursLeft = (new Date(booking.startsAt).getTime() - now) / 3_600_000;
      const closed = hoursLeft <= RULES.freeChangeWindowHours;
      const deadlineAt = new Date(new Date(booking.startsAt).getTime() - RULES.freeChangeWindowHours * 3_600_000).toISOString();
      const deadline = `${flow.formatDay(deadlineAt)} · ${flow.formatTime(deadlineAt)}`;
      if (!isOpen) return { title: t.notifReminderTitle, body: fill(t.notifReminderBody, { name, when, deadline }), icon: "clock", tone: "info", actions: [] };
      return closed
        ? {
            title: t.notifReminderClosedTitle,
            body: fill(t.notifReminderClosedBody, { name, when }),
            icon: "clock",
            tone: "warn",
            actions: [{ label: t.notifContactUs, href: WHATSAPP_URL, external: true, primary: true }, ...view],
          }
        : {
            title: t.notifReminderTitle,
            body: fill(t.notifReminderBody, { name, when, deadline }),
            icon: "clock",
            tone: "warn",
            actions: [{ label: t.rescheduleBooking, href: `${base}?reschedule=${booking.id}`, primary: true }, ...view],
          };
    }
    case "confirmed":
      return { title: t.notifConfirmedTitle, body: fill(t.notifConfirmedBody, { name, when }), icon: "check", tone: "ok", actions: view };
    case "rescheduled":
      return { title: t.notifRescheduledTitle, body: fill(t.notifRescheduledBody, { name, when }), icon: "calendar", tone: "info", actions: view };
    case "expired": {
      const product = booking ? (findPackage(booking.packageId) ?? findService(booking.serviceId)) : undefined;
      const href = booking && product ? `/${booking.locationId}/${booking.packageId ? "packages" : "services"}/${product.id}` : "";
      return {
        title: t.notifExpiredTitle,
        body: fill(t.notifExpiredBody, { name }),
        icon: "clock",
        tone: "info",
        actions: href ? [{ label: t.rebook, href }] : [],
      };
    }
    case "info":
      return {
        title: item.message?.title[language] ?? "",
        body: item.message?.body[language] ?? "",
        icon: "bell",
        tone: "info",
        actions: [],
      };
  }
  return { title: t.notifTitle, body: "", icon: "bell", tone: "info", actions: [] };
}

function timeAgo(iso: string, now: number, language: "ar" | "en", justNow: string) {
  const seconds = Math.round((now - new Date(iso).getTime()) / 1000);
  if (seconds < 45) return justNow;
  const format = new Intl.RelativeTimeFormat(language === "ar" ? "ar-SA" : "en", { numeric: "auto" });
  if (seconds < 3600) return format.format(-Math.round(seconds / 60), "minute");
  if (seconds < 86_400) return format.format(-Math.round(seconds / 3600), "hour");
  return format.format(-Math.round(seconds / 86_400), "day");
}

/** One notification: icon, title, message, time and its buttons. Used in the bell, the page and the pop-up. */
export function NotificationCard({
  item,
  db,
  customerId,
  compact = false,
  onNavigate,
}: {
  item: AppNotification;
  db: Db;
  customerId: string;
  compact?: boolean;
  /** Called after a button is used, so a panel or pop-up can close. */
  onNavigate?: () => void;
}) {
  const flow = useFlow();
  const now = useNow();
  const content = contentFor(item, db, flow, now);
  const unread = !item.readAt;

  function used() {
    if (unread) markNotificationsRead(customerId, [item.id]);
    onNavigate?.();
  }

  return (
    <article className={`notif-card notif-${content.tone}${unread ? " unread" : ""}${compact ? " compact" : ""}`}>
      <span className="notif-icon" aria-hidden="true">
        <Icon name={content.icon} />
      </span>
      <div className="notif-body">
        <div className="notif-top">
          <h3 className="notif-title">{content.title}</h3>
          {unread && <span className="notif-dot" role="img" aria-label={flow.t.notifNew} />}
        </div>
        <p className="notif-text">{content.body}</p>
        <div className="notif-meta">
          <time dateTime={item.createdAt}>{timeAgo(item.createdAt, now, flow.language, flow.t.notifJustNow)}</time>
          {unread && !compact && (
            <button className="notif-read" type="button" onClick={() => markNotificationsRead(customerId, [item.id])}>
              {flow.t.notifMarkRead}
            </button>
          )}
        </div>
        {content.actions.length > 0 && (
          <div className="notif-actions">
            {content.actions.map((action) =>
              action.external ? (
                <a
                  key={action.label}
                  className={`button ${action.primary ? "button-primary" : "button-outline"} notif-button`}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={used}
                >
                  {action.label}
                </a>
              ) : (
                <Link
                  key={action.label}
                  className={`button ${action.primary ? "button-primary" : "button-outline"} notif-button`}
                  href={action.href}
                  onClick={used}
                >
                  {action.label}
                </Link>
              ),
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * The reminder shown on a booking: "you can still reschedule until …". Same look as a notification.
 * `onReschedule` opens the change-time window; without it the card has no button (e.g. on the booking page itself).
 */
export function VisitReminder({ booking, onReschedule }: { booking: Booking; onReschedule?: () => void }) {
  const flow = useFlow();
  const { t, language } = flow;
  const deadlineAt = new Date(new Date(booking.startsAt).getTime() - RULES.freeChangeWindowHours * 3_600_000).toISOString();
  return (
    <article className="notif-card notif-warn unread banner" role="status">
      <span className="notif-icon" aria-hidden="true">
        <Icon name="clock" />
      </span>
      <div className="notif-body">
        <h3 className="notif-title">{t.notifReminderTitle}</h3>
        <p className="notif-text">
          {fill(t.notifReminderBody, {
            name: productName(booking, language),
            when: `${flow.formatDay(booking.startsAt)} · ${flow.formatTime(booking.startsAt)}`,
            deadline: `${flow.formatDay(deadlineAt)} · ${flow.formatTime(deadlineAt)}`,
          })}
        </p>
        {onReschedule && (
          <div className="notif-actions">
            <button className="button button-primary notif-button" type="button" onClick={onReschedule}>
              {t.rescheduleBooking}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

/** Closes a pop-up when the customer clicks elsewhere or presses Escape. */
function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, ref]);
}

/** The bell in the header: unread count, and a panel with the latest messages. */
export function NotificationBell({ base }: { base: string }) {
  const flow = useFlow();
  const { t, dir, formatNumber } = flow;
  const { customer } = useAuth();
  const { db, items, unread } = useNotifications(customer?.id);
  const [open, setOpen] = useState(false);
  // Where the panel sits, measured when it opens so it always stays on screen (left-to-right and right-to-left).
  const [place, setPlace] = useState<{ left: number; width: number } | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useDismiss(open, close, wrapper);

  function toggle() {
    if (open || !wrapper.current) return setOpen(false);
    const rect = wrapper.current.getBoundingClientRect();
    const screen = window.innerWidth;
    if (screen <= 640) {
      setPlace(null); // on phones the panel is fixed across the screen (see the CSS)
    } else {
      const width = Math.min(400, screen - 24);
      const left = Math.max(12, Math.min(rect.right - width, screen - width - 12));
      setPlace({ left: left - rect.left, width });
    }
    setOpen(true);
  }

  if (!customer) return null;
  const latest = items.slice(0, 6);

  return (
    <div className="notif-wrap" ref={wrapper} dir={dir}>
      <button
        className="header-icon-link notif-bell"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread > 0 ? `${t.notifOpen} (${fill(t.notifUnreadCount, { n: formatNumber(unread) })})` : t.notifOpen}
        onClick={toggle}
      >
        <Icon name="bell" />
        {unread > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {unread > 9 ? `${formatNumber(9)}+` : formatNumber(unread)}
          </span>
        )}
      </button>
      {open && (
        <div
          className="notif-panel"
          role="dialog"
          aria-label={t.notifTitle}
          style={place ? { left: place.left, right: "auto", width: place.width } : undefined}
        >
          <div className="notif-panel-head">
            <strong>{t.notifTitle}</strong>
            {unread > 0 && (
              <button className="notif-read" type="button" onClick={() => markNotificationsRead(customer.id)}>
                {t.notifMarkAll}
              </button>
            )}
          </div>
          {latest.length === 0 ? (
            <p className="notif-empty">{t.notifEmpty}</p>
          ) : (
            <div className="notif-list">
              {latest.map((item) => (
                <NotificationCard key={item.id} item={item} db={db} customerId={customer.id} compact onNavigate={close} />
              ))}
            </div>
          )}
          <Link className="notif-all" href={`${base}/account/notifications`} onClick={close}>
            {t.notifViewAll}
          </Link>
        </div>
      )}
    </div>
  );
}

function Toast({ customerId }: { customerId: string }) {
  const flow = useFlow();
  const { items, db } = useNotifications(customerId);
  // Messages that were already there when the customer arrived are in the bell, not pop-ups.
  const [seen] = useState(() => new Set(items.map((item) => item.id)));
  const [dismissed, setDismissed] = useState<string[]>([]);
  const fresh = items.find((item) => !seen.has(item.id) && !item.readAt && !dismissed.includes(item.id));
  const freshId = fresh?.id;

  useEffect(() => {
    if (!freshId) return;
    const timer = setTimeout(() => setDismissed((list) => [...list, freshId]), 10_000);
    return () => clearTimeout(timer);
  }, [freshId]);

  if (!fresh) return null;
  const hide = () => setDismissed((list) => [...list, fresh.id]);

  return (
    <div className="toast-region" aria-live="polite">
      <div className="toast">
        <NotificationCard item={fresh} db={db} customerId={customerId} compact onNavigate={hide} />
        <button
          className="toast-close"
          type="button"
          aria-label={flow.t.notifDismiss}
          onClick={() => {
            markNotificationsRead(customerId, [fresh.id]);
            hide();
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

/** Pops up new messages (a reminder, a confirmation) while the customer is on the site. */
export function NotificationToaster() {
  const { customer, ready } = useAuth();
  if (!ready || !customer) return null;
  return <Toast key={customer.id} customerId={customer.id} />;
}

/** The full list, used on the notifications page. */
export function NotificationList({ customerId }: { customerId: string }) {
  const flow = useFlow();
  const { db, items } = useNotifications(customerId);
  const sorted = useMemo(() => items, [items]);

  if (sorted.length === 0) return <p className="notif-empty">{flow.t.notifEmpty}</p>;
  return (
    <div className="notif-list notif-list-page">
      {sorted.map((item) => (
        <NotificationCard key={item.id} item={item} db={db} customerId={customerId} />
      ))}
    </div>
  );
}
