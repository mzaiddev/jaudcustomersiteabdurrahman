"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, ImagePlaceholder } from "./components";
import Image from "next/image";
import { productCatalogue, productPhotos, type ProductKind } from "./product-catalogue";
import { siteAssets } from "./site-assets";
import {
  BOOKINGS_KEY,
  DRAFT_KEY,
  useStored,
  type BookingDraft,
  type SavedBooking,
} from "./storage";
import { journeyCopy, type Branch } from "./site-data";
import {
  JourneyBreadcrumbs,
  ProductCareInfo,
  useBranch,
  useLanguage,
  useProducts,
} from "./site-ui";

function PreviewNotice() {
  const { language } = useLanguage();

  return (
    <p className="journey-preview-notice">
      <Icon name="lock" />
      {journeyCopy[language].previewNotice}
    </p>
  );
}

export function HomeView() {
  const branch = useBranch();
  const { isArabic, text } = useLanguage();
  const base = `/${branch}`;

  return (
    <>
        <section className="home-hero">
          <div className="home-copy" dir={isArabic ? "rtl" : "ltr"}>
            <p className="eyebrow">
              <span className="eyebrow-line" />
              {text.homeEyebrow}
            </p>
            <h1>{text.homeTitle}</h1>
            <p className="home-description">{text.homeDescription}</p>
            <div className="home-actions">
              <Link className="button button-primary" href={`${base}/booking`}>
                {text.bookSession}
                <Icon name="arrow" />
              </Link>
              <Link className="text-link" href={`${base}/services`}>
                {text.exploreServices}
              </Link>
            </div>
          </div>
          <ImagePlaceholder name="home" label={text.photoPlaceholder} className="home-visual" />
          <span className="home-decoration" aria-hidden="true">ج</span>
        </section>

        <section className="home-discover">
          <div className="section-intro">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              {text.servicesEyebrow}
            </p>
            <h2>{text.exploreServices}</h2>
          </div>
          <div className="discover-grid">
            <Link className="discover-card" href={`${base}/services`}>
              <ImagePlaceholder
                name="individualSessions"
                label={text.photoPlaceholder}
                className="discover-visual"
              />
              <span className="discover-card-content" dir={isArabic ? "rtl" : "ltr"}>
                <span className="discover-card-icon" aria-hidden="true">
                  <Icon name="services" />
                </span>
                <span className="discover-card-title">{text.individualSessions}</span>
                <span className="discover-card-description">{text.individualDescription}</span>
                <span className="discover-card-link">
                  {text.exploreServices}
                  <Icon name="arrow" />
                </span>
              </span>
            </Link>
            <Link className="discover-card" href={`${base}/packages`}>
              <ImagePlaceholder
                name="carePackages"
                label={text.photoPlaceholder}
                className="discover-visual"
              />
              <span className="discover-card-content" dir={isArabic ? "rtl" : "ltr"}>
                <span className="discover-card-icon" aria-hidden="true">
                  <Icon name="packages" />
                </span>
                <span className="discover-card-title">{text.completePackages}</span>
                <span className="discover-card-description">{text.packagesDescription}</span>
                <span className="discover-card-link">
                  {text.explorePackages}
                  <Icon name="arrow" />
                </span>
              </span>
            </Link>
          </div>
        </section>
    </>
  );
}

export function CatalogueView({ kind }: { kind: ProductKind }) {
  const branch = useBranch();
  const { language, text } = useLanguage();
  const { services, packages } = useProducts(branch);
  const base = `/${branch}`;
  const isPackages = kind === "package";
  const items = isPackages ? packages : services;
  const copy = journeyCopy[language];

  return (
    <section className="page-section services-screen">
      <JourneyBreadcrumbs branch={branch} catalogueHref={`${base}/services`} />
      <div className="page-heading journey-page-heading">
        <h1>
          {copy.categoryTitle} {text.branches[branch]}
        </h1>
        <p>{copy.categoryDescription}</p>
        <div className="service-tabs journey-tabs" role="tablist" aria-label={text.services}>
          <Link
            className={`service-tab${!isPackages ? " active" : ""}`}
            role="tab"
            id="individual-tab"
            aria-controls="individual-panel"
            aria-selected={!isPackages}
            href={`${base}/services`}
          >
            {text.individualTab}
          </Link>
          <Link
            className={`service-tab${isPackages ? " active" : ""}`}
            role="tab"
            id="packages-tab"
            aria-controls="packages-panel"
            aria-selected={isPackages}
            href={`${base}/packages`}
          >
            {text.packagesTab}
          </Link>
        </div>
      </div>

      <div
        className={`reference-product-grid${isPackages ? " package-grid" : ""}`}
        id={isPackages ? "packages-panel" : "individual-panel"}
        role="tabpanel"
        aria-labelledby={isPackages ? "packages-tab" : "individual-tab"}
      >
        {items.map((item) => (
          <article className="reference-product-card" key={item.id}>
            <ImagePlaceholder
              name={item.image}
              src={productPhotos[item.id]}
              label={item.title}
              className="reference-product-image"
            />
            <div className="reference-product-info">
              <span className="reference-product-tag">{item.count}</span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <div className="reference-product-facts">
                <span><Icon name="clock" />{item.duration}</span>
                <span><Icon name="location" />{copy.homeService}</span>
              </div>
              <div className="reference-product-meta">
                <strong>{item.priceLabel}</strong>
                <span>{isPackages ? text.packageLabel : text.individualSession}</span>
              </div>
              <Link
                className="button button-primary reference-product-cta"
                href={`${base}/${isPackages ? "packages" : "services"}/${item.id}`}
              >
                {copy.viewDetails}
                <Icon name="arrow" />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <PreviewNotice />
    </section>
  );
}

export function DetailView({ kind }: { kind: ProductKind }) {
  const branch = useBranch();
  const params = useParams<{ id: string }>();
  const { language, text } = useLanguage();
  const { entries } = useProducts(branch);
  const copy = journeyCopy[language];
  const base = `/${branch}`;
  const isPackage = kind === "package";
  const product = entries.find((item) => item.id === params.id && item.kind === kind);

  if (!product) notFound();

  return (
    <section className={`page-section package-screen${isPackage ? "" : " product-details-screen"}`}>
      <JourneyBreadcrumbs
        branch={branch}
        productName={product.title}
        catalogueHref={`${base}/${isPackage ? "packages" : "services"}`}
      />
      <div className="package-feature reference-detail-layout">
        <ImagePlaceholder
          name={product.image}
          src={productPhotos[product.id]}
          label={product.title}
          className="package-photo reference-detail-photo"
        />
        <div className="package-content reference-detail-content">
          <span className="reference-product-tag">{product.count}</span>
          <h1>{product.title}</h1>
          <p className="package-description">{product.description}</p>
          {isPackage && <h2 className="included-heading">{text.productDetails}</h2>}
          <ul className={isPackage ? "included-list" : "reference-detail-facts"}>
            {product.facts.map((fact) => (
              <li key={fact}>
                <Icon name="check" />
                {fact}
              </li>
            ))}
          </ul>
          <div className="reference-detail-price">
            <span>{text.price}</span>
            <strong>{product.priceLabel}</strong>
          </div>
          <Link className="button button-primary package-cta" href={`${base}/booking/${product.id}`}>
            {isPackage ? copy.bookFirst : copy.bookNow}
            <Icon name="arrow" />
          </Link>
        </div>
      </div>
      <ProductCareInfo />
      <PreviewNotice />
    </section>
  );
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function BookingView() {
  const branch = useBranch();
  const params = useParams<{ product?: string }>();
  const { language, isArabic, text } = useLanguage();
  const { entries } = useProducts(branch);
  const [draft, setDraft] = useStored<BookingDraft>(DRAFT_KEY, {
    specialist: "sara",
    date: "",
    time: "",
  });
  const [bookings, setBookings] = useStored<SavedBooking[]>(BOOKINGS_KEY, []);
  const [today, setToday] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date | null>(null);
  const [bookingReady, setBookingReady] = useState(false);
  const productId = params.product ?? draft.product ?? "calm-package";
  const selectedProduct = entries.find((product) => product.id === productId) ?? entries[0];
  const specialist = draft.specialist;
  // Ignore a saved date that has already passed.
  const selectedDate = today && draft.date && draft.date >= localDateKey(today) ? draft.date : "";
  const selectedTime = selectedDate ? draft.time : "";
  const patchDraft = (patch: Partial<BookingDraft>) =>
    setDraft({ ...draft, product: selectedProduct?.id, ...patch });
  const specialistName = (id: string) =>
    id === "sara" ? text.specialistSara : id === "noura" ? text.specialistNoura : text.specialistMaryam;

  useEffect(() => {
    if (params.product && draft.product !== params.product) {
      setDraft({ ...draft, product: params.product });
    }
  }, [params.product, draft, setDraft]);

  useEffect(() => {
    // Dates are resolved after mount so server and client markup match.
    const timer = setTimeout(() => {
      const currentDate = new Date();
      setToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
      setMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const calendarDays: Array<number | null> = month
    ? (() => {
        const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const mondayFirstOffset = (firstOfMonth.getDay() + 1) % 7;
        const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

        return [
          ...Array.from({ length: mondayFirstOffset }, () => null),
          ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
        ];
      })()
    : [];
  const monthLabel = month
    ? new Intl.DateTimeFormat(isArabic ? "ar-SA-u-ca-gregory" : "en-US", {
        month: "long",
        year: "numeric",
      }).format(month)
    : "";
  const selectedDateLabel = selectedDate
    ? new Intl.DateTimeFormat(isArabic ? "ar-SA-u-ca-gregory" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${selectedDate}T12:00:00`))
    : text.noDate;

  function confirmBooking() {
    if (!selectedProduct || !selectedDate || !selectedTime) return;
    setBookings([
      {
        id: String(Date.now()),
        branch,
        product: selectedProduct.id,
        specialist,
        date: selectedDate,
        time: selectedTime,
      },
      ...bookings,
    ]);
    setDraft({ specialist, date: "", time: "", product: selectedProduct.id });
    setBookingReady(true);
  }

  function changeMonth(amount: number) {
    setMonth((current) =>
      current ? new Date(current.getFullYear(), current.getMonth() + amount, 1) : current,
    );
  }

  return (
      <section className="page-section booking-screen">
        <div className="page-heading booking-heading">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            {text.bookingEyebrow}
          </p>
          <h1>{text.bookingTitle}</h1>
        </div>

        <div className="booking-layout">
          <div className="booking-form">
            <div className="booking-progress">
              <div className="progress-step complete">
                <span className="progress-number"><Icon name="check" /></span>
                <span>{text.visitDetails}</span>
              </div>
              <span className="progress-line" />
              <div className="progress-step current">
                <span className="progress-number">2</span>
                <span>{text.specialistAndDate}</span>
              </div>
              <span className="progress-line" />
              <div className="progress-step">
                <span className="progress-number">3</span>
                <span>{text.payment}</span>
              </div>
            </div>

            <fieldset className="booking-group">
              <legend>{text.chooseSpecialist}</legend>
              <div className="specialist-grid">
                {[
                  { id: "sara", label: text.specialistSara },
                  { id: "noura", label: text.specialistNoura },
                  { id: "maryam", label: text.specialistMaryam },
                ].map((person) => (
                  <button
                    className={`specialist-card${specialist === person.id ? " selected" : ""}`}
                    key={person.id}
                    type="button"
                    aria-pressed={specialist === person.id}
                    onClick={() => patchDraft({ specialist: person.id })}
                  >
                    <span className="specialist-photo specialist-logo">
                      <Image src={siteAssets.logoMark} alt="" width={164} height={112} />
                    </span>
                    <span>{person.label}</span>
                    {specialist === person.id && <Icon name="check" className="selected-mark" />}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="appointment-grid">
              <fieldset className="booking-group calendar-group">
                <legend>{text.chooseDate}</legend>
                <div className="calendar">
                  <div className="calendar-toolbar">
                    <button
                      className="calendar-arrow"
                      type="button"
                      aria-label={isArabic ? "الشهر السابق" : "Previous month"}
                      disabled={
                        !month ||
                        !today ||
                        (month.getFullYear() === today.getFullYear() &&
                          month.getMonth() === today.getMonth())
                      }
                      onClick={() => changeMonth(-1)}
                    >
                      <Icon name="arrow" />
                    </button>
                    <strong>{monthLabel}</strong>
                    <button
                      className="calendar-arrow next"
                      type="button"
                      aria-label={isArabic ? "الشهر التالي" : "Next month"}
                      onClick={() => changeMonth(1)}
                    >
                      <Icon name="arrow" />
                    </button>
                  </div>
                  <div className="calendar-grid">
                    {text.weekdays.map((day) => (
                      <span className="calendar-weekday" key={day}>
                        {day}
                      </span>
                    ))}
                    {calendarDays.map((day, index) => {
                      if (day === null) {
                        return <span className="calendar-empty" key={`empty-${index}`} />;
                      }

                      if (!month || !today) return null;

                      const date = new Date(month.getFullYear(), month.getMonth(), day);
                      const dateKey = localDateKey(date);
                      const isPast =
                        date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                      return (
                        <button
                          className={`calendar-day${selectedDate === dateKey ? " selected" : ""}`}
                          key={dateKey}
                          type="button"
                          disabled={isPast}
                          aria-pressed={selectedDate === dateKey}
                          onClick={() => {
                            patchDraft({ date: dateKey, time: "" });
                            setBookingReady(false);
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </fieldset>

              <fieldset className="booking-group time-group">
                <legend>{text.chooseTime}</legend>
                <div className="selected-date">
                  <Icon name="calendar" />
                  <span>{selectedDateLabel}</span>
                </div>
                <div className="time-options">
                  {["10:00", "10:30", "11:00", "12:00", "12:30", "13:00", "14:00", "14:30", "15:00"].map(
                    (time) => (
                      <button
                        className={`time-option${selectedTime === time ? " selected" : ""}`}
                        key={time}
                        type="button"
                        disabled={!selectedDate}
                        aria-pressed={selectedTime === time}
                        onClick={() => {
                          patchDraft({ time });
                          setBookingReady(false);
                        }}
                      >
                        {new Intl.DateTimeFormat(isArabic ? "ar-SA" : "en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(`2020-01-01T${time}:00`))}
                      </button>
                    ),
                  )}
                </div>
                <p className="timezone-note">
                  <Icon name="clock" />
                  {text.timezone}
                </p>
              </fieldset>
            </div>
          </div>

          <aside className="booking-summary">
            <p className="summary-eyebrow">{text.bookingSummaryTitle}</p>
            {selectedProduct && (
              <div className="summary-package">
                <ImagePlaceholder
                  name={selectedProduct.image}
                  src={productPhotos[selectedProduct.id]}
                  label={selectedProduct.title}
                  className="summary-photo"
                />
                <div>
                  <span>
                    {selectedProduct.kind === "package"
                      ? text.packageLabel
                      : text.individualSessions}
                  </span>
                  <strong>{selectedProduct.title}</strong>
                  <small>{selectedProduct.count} · {selectedProduct.duration}</small>
                </div>
              </div>
            )}
            <div className="summary-row">
              <span>{text.specialistLabel}</span>
              <strong>
                {specialistName(specialist)}
              </strong>
            </div>
            <div className="summary-row">
              <span>{text.category}</span>
              <strong>{text.appointmentCategory}</strong>
            </div>
            <div className="summary-row">
              <span>{text.appointmentLabel}</span>
              <strong>{selectedDate ? selectedDateLabel : text.noDate}</strong>
            </div>
            {selectedTime && (
              <div className="summary-row">
                <span>{text.appointmentTime}</span>
                <strong>{selectedTime}</strong>
              </div>
            )}
            {selectedProduct && (
              <div className="summary-price">
                <span>{text.price}</span>
                <strong>{selectedProduct.priceLabel}</strong>
              </div>
            )}
            <button
              className="button button-primary summary-cta"
              type="button"
              disabled={!selectedDate || !selectedTime}
              onClick={confirmBooking}
            >
              {text.continueBooking}
              <Icon name="arrow" />
            </button>
            {bookingReady && (
              <p className="booking-ready" role="status">
                <Icon name="check" />
                {text.bookingReady}
              </p>
            )}
            <p className="secure-note">
              <Icon name="lock" />
              {text.secure}
            </p>
            <p className="summary-branch">
              <Icon name="location" />
              {text.branches[branch]}
            </p>
          </aside>
        </div>
        {bookings.length > 0 && (
        <div className="saved-bookings">
          <h2>{isArabic ? "حجوزاتي المحفوظة" : "My saved bookings"}</h2>
          <ul>
            {bookings.map((saved) => {
              const product = productCatalogue.find((item) => item.id === saved.product);

              return (
                <li key={saved.id}>
                  <div>
                    <strong>{product ? product.name[language] : saved.product}</strong>
                    <span>
                      {text.branches[saved.branch as Branch] ?? saved.branch} · {specialistName(saved.specialist)}
                    </span>
                    <span>
                      {new Intl.DateTimeFormat(isArabic ? "ar-SA-u-ca-gregory" : "en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      }).format(new Date(`${saved.date}T12:00:00`))}{" "}
                      · {saved.time}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookings(bookings.filter((item) => item.id !== saved.id))}
                  >
                    {isArabic ? "إلغاء" : "Remove"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
