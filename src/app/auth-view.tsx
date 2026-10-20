"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "./components";
import { useAuth } from "./auth";
import { Field, FlowNotice, PageLoading, useFlow } from "./flow-ui";
import { locations } from "./mock-data";
import { phoneIsRegistered, registerCustomer, sendOtp, validateAddress, verifyOtp } from "./mock-engine";
import { isMapLink, isValidPhone, normalizePhone, parseMapLink, toWesternDigits } from "./rules";
import { useBranch } from "./site-ui";
import { EngineError, type LocationId } from "./types";

type Mode = "signin" | "register";
type Step = "form" | "code";

/** Only follow redirects that stay inside the current city. */
function safeNext(next: string | null, branch: string) {
  return next && next.startsWith(`/${branch}/`) && !next.startsWith("//") ? next : null;
}

export function AuthView() {
  const branch = useBranch() as LocationId;
  const router = useRouter();
  const search = useSearchParams();
  const { t, isArabic, language } = useFlow();
  const { customer, ready } = useAuth();
  const next = safeNext(search.get("next"), branch);
  const destination = next ?? `/${branch}/account/bookings`;

  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<Step>("form");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState<LocationId>(branch);
  const [label, setLabel] = useState("");
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [notes, setNotes] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (ready && customer) router.replace(destination);
  }, [ready, customer, router, destination]);

  const normalized = normalizePhone(toWesternDigits(phone));
  const isRegister = mode === "register";

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setPhoneError("");
    setInfo("");
  }

  function addressInput() {
    const point = mapLink.trim() ? parseMapLink(mapLink) : null;
    return {
      label: label.trim() || (language === "ar" ? "المنزل" : "Home"),
      district: district.trim(),
      street: street.trim(),
      building: building.trim(),
      notes: notes.trim() || undefined,
      lat: point?.lat,
      lng: point?.lng,
      mapLink: mapLink.trim() || undefined,
      locationId: city,
    };
  }

  async function submitForm(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPhoneError("");
    setInfo("");

    if (!isValidPhone(normalized)) return setPhoneError(t.errPhone);

    if (isRegister) {
      if (phoneIsRegistered(normalized)) return setPhoneError(t.alreadyRegistered);
      if (name.trim().length < 2) return setError(t.errName);
      if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return setError(t.errEmail);
      if (!district.trim()) return setError(t.errDistrict);
      if (!street.trim()) return setError(t.errStreet);
      if (!mapLink.trim()) return setError(t.errMapLink);
      if (!isMapLink(mapLink)) return setError(t.errMapLinkInvalid);
      try {
        validateAddress(addressInput());
      } catch (failure) {
        return setError(failure instanceof EngineError && failure.code === "OUT_OF_COVERAGE" ? t.outOfCoverage : t.genericError);
      }
    } else if (!phoneIsRegistered(normalized)) {
      setMode("register");
      return setInfo(t.noAccountYet);
    }

    setBusy(true);
    try {
      await sendOtp(normalized);
      setStep("code");
    } catch {
      setPhoneError(t.errPhone);
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(event: FormEvent) {
    event.preventDefault();
    setError("");
    const digits = toWesternDigits(code).trim();
    if (!/^\d{4,6}$/.test(digits)) return setError(t.errCode);

    setBusy(true);
    try {
      const result = await verifyOtp(normalized, digits);
      if (!result.customer) {
        await registerCustomer({ phone: normalized, name, email, address: addressInput() });
      }
      router.replace(destination);
    } catch (failure) {
      setError(failure instanceof EngineError && failure.code === "OTP_INVALID" ? t.errCode : t.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await sendOtp(normalized);
      setInfo(t.codeResent);
    } finally {
      setBusy(false);
    }
  }

  if (!ready || customer) return <PageLoading />;

  return (
    <section className="page-section auth-screen" dir={isArabic ? "rtl" : "ltr"}>
      <div className={`auth-card${isRegister && step === "form" ? " auth-card-wide" : ""}`}>
        {step === "form" && (
          <>
            <div className="auth-tabs" role="tablist">
              {(
                [
                  ["signin", t.tabSignIn],
                  ["register", t.tabRegister],
                ] as Array<[Mode, string]>
              ).map(([key, label]) => (
                <button
                  key={key}
                  className={`auth-tab${mode === key ? " active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={mode === key}
                  onClick={() => switchMode(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={submitForm} noValidate>
              <h1>{isRegister ? t.registerTitle : t.authTitle}</h1>
              <p className="auth-lead">{isRegister ? t.registerSubtitle : next ? t.authBookingNote : t.authSubtitle}</p>
              {info && <FlowNotice>{info}</FlowNotice>}

              <Field label={t.phoneLabel} hint={t.phoneHint} error={phoneError} htmlFor="auth-phone">
                <div className="phone-input" dir="ltr">
                  <span className="phone-prefix">+966</span>
                  <input
                    id="auth-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder={t.phonePlaceholder}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    aria-describedby={phoneError ? "auth-phone-error" : "auth-phone-hint"}
                    aria-invalid={Boolean(phoneError)}
                    autoFocus
                  />
                </div>
              </Field>

              {isRegister && (
                <>
                  <h2 className="auth-section">{t.registerPersonal}</h2>
                  <div className="flow-form-grid">
                    <Field label={t.nameLabel} htmlFor="reg-name">
                      <input id="reg-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
                    </Field>
                    <Field label={`${t.emailLabel} (${t.optional})`} htmlFor="reg-email">
                      <input
                        id="reg-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        dir="ltr"
                      />
                    </Field>
                  </div>

                  <h2 className="auth-section">{t.registerLocation}</h2>
                  <p className="flow-muted auth-section-hint">{t.registerLocationHint}</p>
                  <div className="flow-form-grid">
                    <Field label={t.city} htmlFor="reg-city">
                      <select id="reg-city" value={city} onChange={(event) => setCity(event.target.value as LocationId)}>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name[language]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t.addressLabel} htmlFor="reg-label">
                      <input
                        id="reg-label"
                        value={label}
                        placeholder={t.addressLabelPlaceholder}
                        onChange={(event) => setLabel(event.target.value)}
                      />
                    </Field>
                    <Field label={t.district} htmlFor="reg-district">
                      <input
                        id="reg-district"
                        value={district}
                        onChange={(event) => setDistrict(event.target.value)}
                        autoComplete="address-level3"
                      />
                    </Field>
                    <Field label={t.street} htmlFor="reg-street">
                      <input
                        id="reg-street"
                        value={street}
                        onChange={(event) => setStreet(event.target.value)}
                        autoComplete="address-line1"
                      />
                    </Field>
                    <Field label={t.building} htmlFor="reg-building">
                      <input
                        id="reg-building"
                        value={building}
                        onChange={(event) => setBuilding(event.target.value)}
                        autoComplete="address-line2"
                      />
                    </Field>
                    <Field label={t.addressNotes} htmlFor="reg-notes">
                      <input
                        id="reg-notes"
                        value={notes}
                        placeholder={t.addressNotesPlaceholder}
                        onChange={(event) => setNotes(event.target.value)}
                      />
                    </Field>
                  </div>
                  <Field label={t.mapLink} hint={t.mapLinkHint} htmlFor="reg-map">
                    <input id="reg-map" value={mapLink} onChange={(event) => setMapLink(event.target.value)} dir="ltr" />
                  </Field>
                </>
              )}

              {error && <FlowNotice tone="error">{error}</FlowNotice>}
              {isRegister && <p className="flow-muted">{t.codeSentRegister}</p>}

              <button className="button button-primary auth-submit" type="submit" disabled={busy}>
                {busy ? t.sending : t.sendCode}
                <Icon name="arrow" />
              </button>
            </form>
          </>
        )}

        {step === "code" && (
          <form onSubmit={submitCode} noValidate>
            <h1>{t.codeTitle}</h1>
            <p className="auth-lead">
              {t.codeSent} <bdi dir="ltr">{normalized}</bdi>
            </p>
            <Field label={t.codeLabel} error={error} htmlFor="auth-code">
              <input
                id="auth-code"
                className="code-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder={t.codePlaceholder}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "auth-code-error" : undefined}
                dir="ltr"
                autoFocus
              />
            </Field>
            <FlowNotice>{t.previewOtp}</FlowNotice>
            {info && <FlowNotice tone="success">{info}</FlowNotice>}
            <button className="button button-primary auth-submit" type="submit" disabled={busy}>
              {busy ? (isRegister ? t.creating : t.verifying) : isRegister ? t.createAccount : t.verify}
              <Icon name="arrow" />
            </button>
            <div className="auth-links">
              <button type="button" className="text-link" onClick={() => setStep("form")}>
                {t.changeNumber}
              </button>
              <button type="button" className="text-link" onClick={resend} disabled={busy}>
                {t.resendCode}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
