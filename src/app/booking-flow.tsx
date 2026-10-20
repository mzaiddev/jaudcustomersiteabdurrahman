"use client";

import Link from "next/link";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RequireAuth } from "./auth";
import { Icon, ImagePlaceholder } from "./components";
import {
  Field,
  FlowNotice,
  PageLoading,
  SlotPicker,
  Stepper,
  cityLabel,
  useFlow,
  useNow,
} from "./flow-ui";
import { fill } from "./flow-copy";
import {
  computeSlots,
  createBooking,
  discardHold,
  eligibleSpecialists,
  entitlementState,
  lastSpecialistFor,
  payBooking,
  saveAddress,
  useDb,
} from "./mock-engine";
import { findPackage, findService, findSpecialist } from "./mock-data";
import { productCatalogue, productPhotos, type ProductId } from "./product-catalogue";
import {
  ADD_ONS,
  ADD_ON_PRICE,
  addMonthsIso,
  addOnMinutes,
  guestsFor,
  isMapLink,
  parseMapLink,
  priceFor,
  riyadhParts,
  sessionsLeft,
  validAddOns,
} from "./rules";
import { addOnLabels, addOnNames as namesFor } from "./site-data";
import { useBranch } from "./site-ui";
import { draftKey, emptyDraft, readStoredValue, removeStored, useStored, type BookingDraft } from "./storage";
import { EngineError, type Customer, type Entitlement, type LocationId } from "./types";

type PayMethod = "mada" | "card" | "apple" | "later";

const emptyAddressForm = { label: "", district: "", street: "", building: "", notes: "", mapLink: "" };

export function BookingFlow() {
  const branch = useBranch();
  const params = useParams<{ product: string }>();
  const pkg = findPackage(params.product);
  const service = findService(params.product);
  const product = pkg ?? service;

  if (!product || !product.active || !product.locationIds.includes(branch)) notFound();

  return (
    <RequireAuth fallback={<PageLoading />}>
      {(customer) => <BookingFlowInner customer={customer} productId={product.id as ProductId} />}
    </RequireAuth>
  );
}

function BookingFlowInner({ customer, productId }: { customer: Customer; productId: ProductId }) {
  const branch = useBranch() as LocationId;
  const router = useRouter();
  const search = useSearchParams();
  const flow = useFlow();
  const { t, language, isArabic } = flow;
  const { db } = useDb();
  const now = useNow();
  const pkg = findPackage(productId);
  const service = findService(productId);
  const product = (pkg ?? service)!;

  const entitlementParam = search.get("package");
  const entitlement: Entitlement | undefined = db.entitlements.find(
    (item) => item.id === entitlementParam && item.customerId === customer.id && item.packageId === pkg?.id,
  );
  const entitlementProblem = Boolean(entitlementParam) && !entitlement;

  const [draft, setDraft] = useStored<BookingDraft>(draftKey(branch, productId, entitlement?.id), emptyDraft);
  const [step, setStep] = useState(0);
  const [pendingId, setPendingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [method, setMethod] = useState<PayMethod>("mada");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyAddressForm);
  const [formError, setFormError] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  // Merge with what is stored right now, so two patches in the same click don't overwrite each other.
  const patch = (change: Partial<BookingDraft>) => {
    const raw = readStoredValue(draftKey(branch, productId, entitlement?.id));
    let latest = draft;
    try {
      if (raw) latest = JSON.parse(raw) as BookingDraft;
    } catch {
      // Fall back to the rendered draft.
    }
    setDraft({ ...emptyDraft, ...latest, ...change });
  };

  const addresses = customer.addresses.filter((item) => item.locationId === branch);
  const addressId = addresses.some((item) => item.id === draft.addressId)
    ? draft.addressId
    : (addresses[0]?.id ?? "");
  const address = addresses.find((item) => item.id === addressId);
  const otherCityAddresses = customer.addresses.filter((item) => item.locationId !== branch);
  // Saved locations come first; the form only opens from the button (or when nothing is saved at all).
  const showForm = adding || customer.addresses.length === 0;

  const baseGuests = pkg ? pkg.guests : 1;
  const allowsExtraGuests = Boolean(pkg && pkg.extraGuestPrice > 0 && !entitlement);
  const guests = allowsExtraGuests ? guestsFor(product, draft.guests) : baseGuests;
  const addOns = pkg ? [] : validAddOns(draft.addOns);
  const extraMinutes = addOnMinutes(addOns);
  const price = priceFor(product, guests, addOns);
  const addOnNames = namesFor(language);
  const serviceId = pkg ? pkg.serviceId : service?.id;
  const specialistOptions = eligibleSpecialists(branch, serviceId);
  const suggestedId = entitlement ? lastSpecialistFor(db, entitlement.id) : undefined;

  const slotQuery = { locationId: branch, serviceId: service?.id, packageId: pkg?.id, guests, extraMinutes };
  const slot = (() => {
    if (!draft.time) return null;
    const found = computeSlots(db, {
      ...slotQuery,
      date: riyadhParts(draft.time).date,
      excludeBookingId: pendingId || undefined,
    }).find(
      (option) => option.startsAt === draft.time,
    );
    if (!found) return null;
    return draft.specialist === "any" || found.specialistIds.includes(draft.specialist) ? found : null;
  })();

  const chosenSpecialist = findSpecialist(draft.specialist === "any" ? "" : draft.specialist);
  const steps = entitlement ? [t.stepVisit, t.stepTime, t.stepConfirm] : [t.stepVisit, t.stepTime, t.stepPay];
  const isPurchase = Boolean(pkg && !entitlement);
  const title = entitlement
    ? t.bookingTitleSession
    : pkg
      ? productCatalogue.find((item) => item.id === pkg.id)?.repeat === false
        ? t.bookingTitleVisit
        : t.bookingTitlePackage
      : t.bookingTitle;
  const validUntil = pkg ? addMonthsIso(now, pkg.validityMonths) : "";

  function goTo(next: number) {
    setError("");
    if (next < 2 && pendingId) {
      discardHold(customer.id, pendingId);
      setPendingId("");
    }
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitAddress() {
    setFormError("");
    if (!form.district.trim()) return setFormError(t.errDistrict);
    if (!form.street.trim()) return setFormError(t.errStreet);
    if (!form.mapLink.trim()) return setFormError(t.errMapLink);
    if (!isMapLink(form.mapLink)) return setFormError(t.errMapLinkInvalid);
    const point = parseMapLink(form.mapLink);
    setSavingAddress(true);
    try {
      const saved = await saveAddress(customer.id, {
        label: form.label.trim() || (isArabic ? "المنزل" : "Home"),
        district: form.district.trim(),
        street: form.street.trim(),
        building: form.building.trim(),
        notes: form.notes.trim() || undefined,
        lat: point?.lat,
        lng: point?.lng,
        mapLink: form.mapLink.trim(),
        locationId: branch,
      });
      patch({ addressId: saved.id });
      setForm(emptyAddressForm);
      setAdding(false);
    } catch (failure) {
      setFormError(failure instanceof EngineError && failure.code === "OUT_OF_COVERAGE" ? t.outOfCoverage : t.genericError);
    } finally {
      setSavingAddress(false);
    }
  }

  function describeError(failure: unknown) {
    if (failure instanceof EngineError) {
      if (failure.code === "PAYMENT_FAILED") return t.paymentDeclined;
      if (failure.code === "SLOT_UNAVAILABLE") {
        return failure.detail === "specialist_busy" ? t.specialistBusy : t.slotTaken;
      }
      if (failure.code === "PACKAGE_EXPIRED") return t.packageExpired;
      if (failure.code === "PACKAGE_SESSIONS_EXHAUSTED") return t.packageExhausted;
      if (failure.code === "OUT_OF_COVERAGE") return t.outOfCoverage;
    }
    return t.genericError;
  }

  function cardIsValid() {
    const digits = card.number.replace(/\D/g, "");
    return (
      digits.length === 16 &&
      /^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry) &&
      /^\d{3,4}$/.test(card.cvc) &&
      card.name.trim().length > 1
    );
  }

  const needsPayment = !entitlement;
  const canSubmit = Boolean(slot && address) && (method !== "card" || !needsPayment || cardIsValid());

  async function submit() {
    if (!slot || !address) return;
    setError("");
    setBusy(true);
    let bookingId = pendingId;
    try {
      if (!bookingId) {
        const booking = await createBooking(customer.id, {
          locationId: branch,
          serviceId: service?.id,
          packageId: pkg?.id,
          entitlementId: entitlement?.id,
          specialistId: draft.specialist,
          startsAt: slot.startsAt,
          guests,
          addOns,
          address,
          notes: draft.notes,
        });
        bookingId = booking.id;
        setPendingId(booking.id);
        if (booking.status === "confirmed") {
          finish(booking.id, false);
          return;
        }
      }

      if (method === "later") {
        finish(bookingId, true);
        return;
      }

      const digits = card.number.replace(/\D/g, "");
      await payBooking(customer.id, bookingId, "online", method === "card" && digits === "4000000000000002" ? "fail" : "success");
      finish(bookingId, false);
    } catch (failure) {
      setError(describeError(failure));
      setBusy(false);
    }
  }

  function finish(bookingId: string, held: boolean) {
    removeStored(draftKey(branch, productId, entitlement?.id));
    router.push(`/${branch}/confirmation/${bookingId}${held ? "?held=1" : ""}`);
  }

  if (entitlementProblem) {
    return (
      <section className="page-section booking-screen">
        <FlowNotice tone="error">{t.packageNotFound}</FlowNotice>
        <Link className="button button-outline flow-inline-button" href={`/${branch}/account/packages`}>
          {t.backToPackages}
        </Link>
      </section>
    );
  }

  if (entitlement && (entitlementState(entitlement) !== "active" || sessionsLeft(entitlement) <= 0)) {
    return (
      <section className="page-section booking-screen">
        <FlowNotice tone="error">
          {entitlementState(entitlement) === "expired"
            ? t.expiredNote
            : entitlementState(entitlement) === "used_up"
              ? t.usedUpNote
              : t.packageExhausted}
        </FlowNotice>
        <Link className="button button-outline flow-inline-button" href={`/${branch}/account/packages`}>
          {t.backToPackages}
        </Link>
      </section>
    );
  }

  return (
    <section className="page-section booking-screen">
      <div className="page-heading booking-heading">
        <p className="eyebrow">
          <span className="eyebrow-line" />
          {t.bookingEyebrow}
        </p>
        <h1>{title}</h1>
      </div>

      <div className="booking-layout">
        <div className="booking-form">
          <Stepper steps={steps} current={step} />

          {step === 0 && (
            <div className="flow-step">
              <fieldset className="booking-group">
                <legend>{t.visitAddress}</legend>
                <p className="flow-muted">{t.visitAddressHint}</p>

                {addresses.length > 0 && (
                  <div className="address-list" role="radiogroup" aria-label={t.visitAddress}>
                    {addresses.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={addressId === item.id}
                        className={`address-card${addressId === item.id ? " selected" : ""}`}
                        onClick={() => {
                          patch({ addressId: item.id });
                          setAdding(false);
                        }}
                      >
                        <Icon name="location" />
                        <span>
                          <strong>{item.label}</strong>
                          <small>
                            {[item.district, item.street, item.building].filter(Boolean).join("، ")}
                          </small>
                          {item.notes && <small>{item.notes}</small>}
                        </span>
                        {addressId === item.id && <Icon name="check" className="selected-mark" />}
                      </button>
                    ))}
                  </div>
                )}

                {otherCityAddresses.length > 0 && (
                  <div className="address-list address-list-other">
                    <p className="flow-muted">{t.otherCityAddresses}</p>
                    {otherCityAddresses.map((item) => {
                      const city = cityLabel(item.locationId, language);
                      const canSwitch = !entitlement && product.locationIds.includes(item.locationId);

                      return (
                        <div className="address-card address-card-disabled" key={item.id}>
                          <Icon name="location" />
                          <span>
                            <strong>
                              {item.label} · {city}
                            </strong>
                            <small>{[item.district, item.street, item.building].filter(Boolean).join("، ")}</small>
                            {canSwitch ? (
                              <Link className="text-link" href={`/${item.locationId}/book/${productId}`}>
                                {fill(t.bookInCity, { city })}
                              </Link>
                            ) : (
                              <small>{fill(t.notAvailableInCity, { city })}</small>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {addresses.length === 0 && customer.addresses.length > 0 && (
                  <p className="flow-muted">{fill(t.noAddressInCity, { city: cityLabel(branch, language) })}</p>
                )}

                {!showForm && (
                  <button className="button button-outline add-location-button" type="button" onClick={() => setAdding(true)}>
                    <span>+ {t.newAddress}</span>
                  </button>
                )}

                {showForm && (
                  <div className="flow-form-grid address-form">
                    <h3>{t.newAddress}</h3>
                    <Field label={t.addressLabel} htmlFor="addr-label">
                      <input
                        id="addr-label"
                        value={form.label}
                        placeholder={t.addressLabelPlaceholder}
                        onChange={(event) => setForm({ ...form, label: event.target.value })}
                      />
                    </Field>
                    <Field label={t.district} htmlFor="addr-district">
                      <input
                        id="addr-district"
                        value={form.district}
                        onChange={(event) => setForm({ ...form, district: event.target.value })}
                        autoComplete="address-level3"
                      />
                    </Field>
                    <Field label={t.street} htmlFor="addr-street">
                      <input
                        id="addr-street"
                        value={form.street}
                        onChange={(event) => setForm({ ...form, street: event.target.value })}
                        autoComplete="address-line1"
                      />
                    </Field>
                    <Field label={t.building} htmlFor="addr-building">
                      <input
                        id="addr-building"
                        value={form.building}
                        onChange={(event) => setForm({ ...form, building: event.target.value })}
                        autoComplete="address-line2"
                      />
                    </Field>
                    <Field label={t.addressNotes} htmlFor="addr-notes">
                      <input
                        id="addr-notes"
                        value={form.notes}
                        placeholder={t.addressNotesPlaceholder}
                        onChange={(event) => setForm({ ...form, notes: event.target.value })}
                      />
                    </Field>
                    <Field label={t.mapLink} hint={t.mapLinkHint} htmlFor="addr-map">
                      <input
                        id="addr-map"
                        value={form.mapLink}
                        onChange={(event) => setForm({ ...form, mapLink: event.target.value })}
                        dir="ltr"
                      />
                    </Field>
                    {formError && <FlowNotice tone="error">{formError}</FlowNotice>}
                    <div className="flow-actions">
                      <button
                        className="button button-primary"
                        type="button"
                        onClick={submitAddress}
                        disabled={savingAddress}
                      >
                        {savingAddress ? t.savingAddress : t.saveAddress}
                        <Icon name="check" />
                      </button>
                      {customer.addresses.length > 0 && (
                        <button className="text-link" type="button" onClick={() => setAdding(false)}>
                          {t.cancel}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </fieldset>

              {allowsExtraGuests && pkg && (
                <fieldset className="booking-group">
                  <legend>{t.guestsTitle}</legend>
                  <p className="flow-muted">
                    {fill(t.guestsHint, { n: pkg.guests, price: pkg.extraGuestPrice })}
                  </p>
                  <div className="guest-stepper">
                    <button
                      type="button"
                      aria-label="-"
                      disabled={guests <= pkg.guests}
                      onClick={() => patch({ guests: guests - 1, time: "" })}
                    >
                      −
                    </button>
                    <output aria-live="polite">
                      {flow.formatNumber(guests)} {t.guestsUnit}
                    </output>
                    <button
                      type="button"
                      aria-label="+"
                      disabled={guests >= 10}
                      onClick={() => patch({ guests: guests + 1, time: "" })}
                    >
                      +
                    </button>
                  </div>
                </fieldset>
              )}

              {service && (
                <fieldset className="booking-group">
                  <legend>{t.addOnsTitle}</legend>
                  <p className="flow-muted">
                    {fill(t.addOnsHint, { price: flow.formatNumber(ADD_ON_PRICE), m: flow.formatNumber(20) })}
                  </p>
                  <div className="pay-methods add-on-list" role="group" aria-label={t.addOnsTitle}>
                    {ADD_ONS.map((item, index) => {
                      const checked = addOns.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          className={`pay-method add-on-option${checked ? " selected" : ""}`}
                          onClick={() =>
                            patch({
                              addOns: checked ? addOns.filter((id) => id !== item.id) : [...addOns, item.id],
                              time: "",
                            })
                          }
                        >
                          <span>
                            <strong>{addOnNames[index]}</strong>
                            <small>
                              {flow.money(ADD_ON_PRICE)} ·{" "}
                              {item.minutes > 0
                                ? fill(t.addOnMinutes, { m: flow.formatNumber(item.minutes) })
                                : t.addOnNoTime}
                            </small>
                          </span>
                          {checked && <Icon name="check" className="selected-mark" />}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {!address && <p className="flow-muted">{t.pickAddress}</p>}
              <div className="flow-actions">
                <button className="button button-primary" type="button" disabled={!address} onClick={() => goTo(1)}>
                  {t.next}
                  <Icon name="arrow" />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flow-step">
              <SlotPicker
                db={db}
                query={slotQuery}
                specialists={specialistOptions}
                specialistId={draft.specialist}
                startsAt={slot?.startsAt ?? ""}
                suggestedId={suggestedId}
                onSpecialist={(id) => patch({ specialist: id, time: "" })}
                onSlot={(picked) => patch({ time: picked?.startsAt ?? "" })}
              />
              <fieldset className="booking-group">
                <legend>{t.notesTitle}</legend>
                <textarea
                  className="flow-textarea"
                  rows={3}
                  value={draft.notes}
                  placeholder={t.notesPlaceholder}
                  onChange={(event) => patch({ notes: event.target.value })}
                  aria-label={t.notesTitle}
                />
              </fieldset>
              <div className="flow-actions">
                <button className="button button-outline" type="button" onClick={() => goTo(0)}>
                  {t.back}
                </button>
                <button className="button button-primary" type="button" disabled={!slot} onClick={() => goTo(2)}>
                  {t.next}
                  <Icon name="arrow" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flow-step">
              <fieldset className="booking-group">
                <legend>{t.reviewTitle}</legend>
                {isPurchase && pkg && (
                  <ul className="flow-facts">
                    <li>
                      <Icon name="packages" />
                      {fill(t.packageSessions, { n: flow.formatNumber(pkg.sessions) })} ·{" "}
                      {fill(t.packageValidUntil, { date: flow.formatDate(validUntil) })}
                    </li>
                    <li>
                      <Icon name="check" />
                      {t.packageFirstRule}
                    </li>
                  </ul>
                )}
                {entitlement && (
                  <p className="flow-muted">
                    {fill(t.sessionsLeftAfter, { n: flow.formatNumber(sessionsLeft(entitlement) - 1) })}
                  </p>
                )}
                {!entitlement && <p className="flow-muted">{t.freeChangeNote}</p>}
              </fieldset>

              {needsPayment && (
                <fieldset className="booking-group">
                  <legend>{t.paymentTitle}</legend>
                  <div className="pay-methods" role="radiogroup" aria-label={t.paymentTitle}>
                    {(
                      [
                        ["mada", t.payMada],
                        ["card", t.payCard],
                        ["apple", t.payApple],
                        ["later", t.payLater],
                      ] as Array<[PayMethod, string]>
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={method === id}
                        className={`pay-method${method === id ? " selected" : ""}`}
                        onClick={() => setMethod(id)}
                      >
                        <span>{label}</span>
                        {method === id && <Icon name="check" className="selected-mark" />}
                      </button>
                    ))}
                  </div>

                  {method === "later" && <FlowNotice>{t.payLaterHint}</FlowNotice>}

                  {method === "card" && (
                    <div className="flow-form-grid card-form" dir="ltr">
                      <Field label={t.cardNumber} htmlFor="card-number">
                        <input
                          id="card-number"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="4242 4242 4242 4242"
                          value={card.number}
                          onChange={(event) =>
                            setCard({
                              ...card,
                              number: event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 16)
                                .replace(/(.{4})/g, "$1 ")
                                .trim(),
                            })
                          }
                        />
                      </Field>
                      <Field label={t.cardExpiry} htmlFor="card-expiry">
                        <input
                          id="card-expiry"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          placeholder="MM/YY"
                          value={card.expiry}
                          onChange={(event) => {
                            const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                            setCard({ ...card, expiry: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits });
                          }}
                        />
                      </Field>
                      <Field label={t.cardCvc} htmlFor="card-cvc">
                        <input
                          id="card-cvc"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          placeholder="123"
                          value={card.cvc}
                          onChange={(event) => setCard({ ...card, cvc: event.target.value.replace(/\D/g, "").slice(0, 4) })}
                        />
                      </Field>
                      <Field label={t.cardName} htmlFor="card-name">
                        <input
                          id="card-name"
                          autoComplete="cc-name"
                          value={card.name}
                          onChange={(event) => setCard({ ...card, name: event.target.value })}
                        />
                      </Field>
                      <p className="flow-muted card-test-note" dir={isArabic ? "rtl" : "ltr"}>
                        {t.testCards}
                      </p>
                    </div>
                  )}
                </fieldset>
              )}

              {error && <FlowNotice tone="error">{error}</FlowNotice>}
              <p className="flow-muted">{t.previewNotice}</p>

              <div className="flow-actions">
                <button className="button button-outline" type="button" onClick={() => goTo(1)} disabled={busy}>
                  {t.back}
                </button>
                <button className="button button-primary" type="button" onClick={submit} disabled={!canSubmit || busy}>
                  {busy
                    ? t.processing
                    : !needsPayment
                      ? t.confirmBooking
                      : method === "later"
                        ? t.holdBooking
                        : fill(t.payNow, { amount: flow.formatNumber(price.total) })}
                  <Icon name="arrow" />
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="booking-summary">
          <p className="summary-eyebrow">{t.summaryTitle}</p>
          <div className="summary-package">
            <ImagePlaceholder
              name={product.id === pkg?.id ? "packageQuiet" : "serviceMassage"}
              src={productPhotos[productId]}
              label={product.name[language]}
              className="summary-photo"
            />
            <div>
              <span>{pkg ? t.summaryPackage : t.summaryProduct}</span>
              <strong>{product.name[language]}</strong>
              <small>
                {flow.formatNumber(product.minutes * guests + extraMinutes)} {t.minutes}
              </small>
            </div>
          </div>
          <div className="summary-row">
            <span>{t.summaryCity}</span>
            <strong>{cityLabel(branch, language)}</strong>
          </div>
          {address && (
            <div className="summary-row">
              <span>{t.summaryAddress}</span>
              <strong>{[address.district, address.street].filter(Boolean).join("، ")}</strong>
            </div>
          )}
          {allowsExtraGuests && (
            <div className="summary-row">
              <span>{t.summaryGuests}</span>
              <strong>{flow.formatNumber(guests)}</strong>
            </div>
          )}
          {addOns.length > 0 && (
            <div className="summary-row">
              <span>{t.priceAddOns}</span>
              <strong>{addOnLabels(addOns, language)}</strong>
            </div>
          )}
          <div className="summary-row">
            <span>{t.summarySpecialist}</span>
            <strong>
              {chosenSpecialist ? chosenSpecialist.name[language] : t.anySpecialist}
            </strong>
          </div>
          <div className="summary-row">
            <span>{t.summaryWhen}</span>
            <strong>
              {slot ? (
                <>
                  {flow.formatDay(slot.startsAt)}
                  <br />
                  {flow.formatTime(slot.startsAt)}
                </>
              ) : (
                t.noTime
              )}
            </strong>
          </div>
          {entitlement ? (
            <div className="summary-price">
              <span>{t.priceTotal}</span>
              <strong>{t.coveredByPackage}</strong>
            </div>
          ) : (
            <>
              {price.extraGuests > 0 && (
                <div className="summary-row">
                  <span>{t.priceBase}</span>
                  <strong>{flow.money(price.base)}</strong>
                </div>
              )}
              {price.extraGuests > 0 && (
                <div className="summary-row">
                  <span>
                    {t.priceExtraGuests} × {flow.formatNumber(price.extraGuestCount)}
                  </span>
                  <strong>{flow.money(price.extraGuests)}</strong>
                </div>
              )}
              {price.addOns > 0 && (
                <>
                  <div className="summary-row">
                    <span>{t.priceBase}</span>
                    <strong>{flow.money(price.base)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>
                      {t.priceAddOns} × {flow.formatNumber(addOns.length)}
                    </span>
                    <strong>{flow.money(price.addOns)}</strong>
                  </div>
                </>
              )}
              <div className="summary-price">
                <span>{t.priceTotal}</span>
                <strong>{flow.money(price.total)}</strong>
              </div>
            </>
          )}
          <p className="secure-note">
            <Icon name="lock" />
            {t.secureNote}
          </p>
        </aside>
      </div>
    </section>
  );
}
