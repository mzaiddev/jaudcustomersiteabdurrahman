"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { siteAssets } from "./site-assets";

type Language = "ar" | "en";
type Branch = "riyadh" | "jazan" | "khobar";
type Screen = "welcome" | "home" | "services" | "package" | "booking";
type ServiceTab = "individual" | "packages";
type BookingProduct = "quiet" | "relaxation" | "massage" | "skin" | "foot";
type IconName = keyof typeof siteAssets.icons;
type ImageName = keyof typeof siteAssets.images;

const translations = {
  ar: {
    home: "الرئيسية",
    services: "الخدمات",
    packages: "الباقات",
    bookings: "حجوزاتي",
    location: "الفرع",
    language: "English",
    welcomeEyebrow: "جود سبا · عناية واسترخاء",
    welcomeTitle: "لحظة هدوء... تبدأ من هنا",
    welcomeSubtitle: "العناية أقرب إليك",
    welcomeDescription: "اختاري فرعك، ودعي تجربة جود سبا تأتي إليك في راحة منزلك.",
    chooseBranch: "اختاري فرعك",
    chooseBranchHint: "اختاري الفرع الأقرب إليك",
    continue: "اكتشفي تجربة جود",
    homeEyebrow: "أهلاً بكِ في جود سبا",
    homeTitle: "لحظة عناية، في راحة منزلكِ",
    homeDescription: "اكتشفي جلسات العناية والباقات المناسبة لكِ.",
    exploreServices: "اكتشفي الخدمات",
    explorePackages: "تصفحي الباقات",
    bookSession: "احجزي جلستك",
    individualSessions: "الجلسات الفردية",
    individualDescription: "جلسات عناية متخصصة تلبي احتياجك.",
    completePackages: "باقات متكاملة",
    packagesDescription: "تجربة عناية متجددة، على وقتك.",
    servicesEyebrow: "اختاري ما يناسبك",
    servicesTitle: "اختاري لحظة العناية المناسبة لكِ",
    individualTab: "الجلسات الفردية",
    packagesTab: "الباقات",
    serviceMassage: "مساج استرخائي للجسم بالكامل",
    serviceSkin: "عناية مرطبة للوجه",
    serviceFoot: "جلسة عناية بالأقدام",
    serviceHospitality: "ضيافة وعناية مكملة",
    individualSession: "جلسة فردية",
    ninetyMinutes: "90 دقيقة",
    unknownSessions: "__ جلسات",
    unknownValidity: "يُحدد لاحقاً",
    priceLater: "السعر يُحدد لاحقاً",
    details: "عرض التفاصيل",
    sessions: "جلسات",
    quietPackage: "باقة الهدوء",
    relaxationPackage: "باقة الاسترخاء الشامل",
    packageEyebrow: "لحظات عناية، اختيرت لكِ",
    packageDescription:
      "استرخاء عميق وتجديد متكامل يجمع بين لمسات علاجية مختارة بعناية لإعادة التوازن للجسم والذهن.",
    includedServices: "الخدمات التي تشملها",
    sessionCount: "عدد الجلسات",
    sessionDuration: "مدة الجلسة",
    packageValidity: "صلاحية الباقة",
    price: "السعر",
    sessionsThree: "3 جلسات",
    sixtyMinutes: "60 دقيقة",
    thirtyDays: "30 يوماً",
    packageNotice:
      "يشترط حجز موعد الجلسة الأولى عند شراء الباقة. جميع جلسات الباقة تُقدَّم بواسطة الأخصائية المختارة.",
    bookPackage: "احجزي الباقة",
    bookingEyebrow: "خطوة أقرب إلى راحتك",
    bookingTitle: "اختاري أخصائيتك وموعدك",
    visitDetails: "بيانات الزيارة",
    specialistAndDate: "الأخصائية والموعد",
    bookingSummaryTitle: "ملخص الحجز",
    chooseSpecialist: "اختاري أخصائيتك",
    specialistSara: "الأخصائية سارة",
    specialistNoura: "الأخصائية نورة",
    specialistMaryam: "الأخصائية مريم",
    chooseDate: "اختاري التاريخ",
    chooseTime: "اختاري الوقت المتاح",
    appointmentTime: "موعد الجلسة الأولى",
    packageLabel: "الباقة",
    specialistLabel: "الأخصائية",
    appointmentLabel: "الموعد",
    appointmentCategory: "عناية واسترخاء",
    durationNinety: "90 دقيقة",
    payment: "الدفع",
    category: "نوع الجلسة",
    secure: "بياناتكِ آمنة ومشفرة",
    timezone: "جميع المواعيد بتوقيت الرياض (GMT+3)",
    continueBooking: "متابعة",
    bookingReady:
      "تم حفظ اختياراتك لهذه الجلسة. أكّدي الحجز بعد ربط بوابة الدفع.",
    branchHint: "العناية أقرب إليكِ في",
    footerLine: "عناية هادئة، أينما كنتِ.",
    photoPlaceholder: "أضيفي الصورة هنا",
    logoAlt: "شعار جود سبا",
    noDate: "اختاري تاريخاً متاحاً",
    weekdays: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"],
    branches: {
      riyadh: "الرياض",
      jazan: "جازان",
      khobar: "الخبر",
    },
  },
  en: {
    home: "Home",
    services: "Treatments",
    packages: "Packages",
    bookings: "My bookings",
    location: "Branch",
    language: "العربية",
    welcomeEyebrow: "JOUD SPA · CARE & WELLNESS",
    welcomeTitle: "A moment of calm begins here",
    welcomeSubtitle: "Care, closer to you",
    welcomeDescription:
      "Choose your branch and let the Joud Spa experience come to you, in the comfort of your home.",
    chooseBranch: "Choose your branch",
    chooseBranchHint: "Choose the branch closest to you",
    continue: "Discover the Joud experience",
    homeEyebrow: "WELCOME TO JOUD SPA",
    homeTitle: "A moment of care, in the comfort of home",
    homeDescription:
      "Discover thoughtfully chosen treatments and packages, made to fit your needs.",
    exploreServices: "Explore treatments",
    explorePackages: "Browse packages",
    bookSession: "Book your session",
    individualSessions: "Individual sessions",
    individualDescription: "Personalised care, thoughtfully tailored to you.",
    completePackages: "Complete care packages",
    packagesDescription: "A renewed care experience, on your time.",
    servicesEyebrow: "FIND YOUR MOMENT",
    servicesTitle: "Choose the care that feels right",
    individualTab: "Individual sessions",
    packagesTab: "Packages",
    serviceMassage: "Full-body relaxation massage",
    serviceSkin: "Hydrating facial treatment",
    serviceFoot: "Foot care session",
    serviceHospitality: "A thoughtful finishing touch",
    individualSession: "Individual session",
    ninetyMinutes: "90 minutes",
    unknownSessions: "__ sessions",
    unknownValidity: "To be confirmed",
    priceLater: "Price to be confirmed",
    details: "View details",
    sessions: "sessions",
    quietPackage: "The Quiet Package",
    relaxationPackage: "Complete Relaxation Package",
    packageEyebrow: "A collection of moments, chosen for you",
    packageDescription:
      "Deep relaxation and complete renewal, with carefully chosen therapeutic touches to restore balance to body and mind.",
    includedServices: "What's included",
    sessionCount: "Sessions",
    sessionDuration: "Session length",
    packageValidity: "Package validity",
    price: "Price",
    sessionsThree: "3 sessions",
    sixtyMinutes: "60 minutes",
    thirtyDays: "30 days",
    packageNotice:
      "The first session must be booked when purchasing the package. All sessions are provided by your selected specialist.",
    bookPackage: "Book this package",
    bookingEyebrow: "One step closer to unwinding",
    bookingTitle: "Choose your specialist and appointment",
    visitDetails: "Visit details",
    specialistAndDate: "Specialist & appointment",
    bookingSummaryTitle: "Booking summary",
    chooseSpecialist: "Choose your specialist",
    specialistSara: "Specialist Sara",
    specialistNoura: "Specialist Noura",
    specialistMaryam: "Specialist Maryam",
    chooseDate: "Choose a date",
    chooseTime: "Choose an available time",
    appointmentTime: "First session",
    packageLabel: "Package",
    specialistLabel: "Specialist",
    appointmentLabel: "Appointment",
    appointmentCategory: "Care & relaxation",
    durationNinety: "90 minutes",
    payment: "Payment",
    category: "Session type",
    secure: "Your details are safe and encrypted",
    timezone: "All appointments use Riyadh time (GMT+3)",
    continueBooking: "Continue",
    bookingReady:
      "Your session selections are ready. Connect a payment provider to confirm your booking.",
    branchHint: "Thoughtful care in",
    footerLine: "A quieter kind of care, wherever you are.",
    photoPlaceholder: "Add your photo here",
    logoAlt: "Joud Spa logo",
    noDate: "Choose an available date",
    weekdays: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    branches: {
      riyadh: "Riyadh",
      jazan: "Jazan",
      khobar: "Khobar",
    },
  },
} as const;

const branches: Branch[] = ["riyadh", "jazan", "khobar"];

const languageListeners = new Set<() => void>();

function getLanguageSnapshot(): Language {
  if (typeof window === "undefined") return "ar";
  return window.localStorage.getItem("joud-language") === "en" ? "en" : "ar";
}

function subscribeToLanguage(listener: () => void) {
  languageListeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    languageListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function saveLanguage(language: Language) {
  window.localStorage.setItem("joud-language", language);
  languageListeners.forEach((listener) => listener());
}

function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const source = siteAssets.icons[name];

  if (source) {
    return (
      <Image
        className={`icon ${className}`}
        src={source}
        alt=""
        aria-hidden="true"
        width={20}
        height={20}
      />
    );
  }

  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M4 10h11m-4-4 4 4-4 4" />,
    calendar: (
      <>
        <rect x="3" y="5" width="14" height="12" rx="1" />
        <path d="M6.5 3v4M13.5 3v4M3 9h14" />
      </>
    ),
    cart: (
      <>
        <path d="M2.5 3h2l1.8 9.2h8.9l2-6.2H5.2" />
        <circle cx="7.5" cy="16" r="1.2" />
        <circle cx="14" cy="16" r="1.2" />
      </>
    ),
    check: <path d="m4 10 4 4 8-8" />,
    clock: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6v4l3 2" />
      </>
    ),
    globe: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="M3 10h14M10 3a11 11 0 0 1 0 14M10 3a11 11 0 0 0 0 14" />
      </>
    ),
    home: <path d="m3 9 7-6 7 6v8H5V9m3 8v-5h4v5" />,
    location: (
      <>
        <path d="M10 17s5-4.7 5-8.5a5 5 0 1 0-10 0C5 12.3 10 17 10 17Z" />
        <circle cx="10" cy="8.5" r="1.5" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="9" width="12" height="9" rx="1.5" />
        <path d="M7 9V6a3 3 0 0 1 6 0v3m-3 4v2" />
      </>
    ),
    packages: (
      <>
        <path d="m10 2 7 4v8l-7 4-7-4V6l7-4Z" />
        <path d="m3 6 7 4 7-4m-7 4v8" />
      </>
    ),
    services: (
      <>
        <path d="M4 16c2-1 3-3 3-6 0-2 1-4 3-4s3 2 3 4c0 3 1 5 3 6M3 18h14M8 3c0 1 .8 2 2 2s2-1 2-2" />
      </>
    ),
    user: (
      <>
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c.5-3 2.5-4.5 6-4.5s5.5 1.5 6 4.5" />
      </>
    ),
  };

  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.35"
      >
        {paths[name]}
      </g>
    </svg>
  );
}

function ImagePlaceholder({
  name,
  label,
  className = "",
}: {
  name: ImageName;
  label: string;
  className?: string;
}) {
  const source = siteAssets.images[name];
  const isIconArtwork = name === "serviceSkin" || name === "serviceFoot";

  return (
    <div
      className={`image-frame${isIconArtwork ? " icon-art-frame" : ""} ${className}`}
      style={name === "welcome" ? { position: "absolute", inset: 0 } : undefined}
    >
      {source ? (
        <Image
          className={`frame-image${isIconArtwork ? " frame-icon-art" : ""}`}
          src={source}
          alt={isIconArtwork ? "" : label}
          aria-hidden={isIconArtwork ? true : undefined}
          fill
          sizes={
            name === "home"
              ? "100vw"
              : "(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 40vw"
          }
        />
      ) : (
        <div className="image-placeholder" role="img" aria-label={label}>
          <span className="placeholder-orb" />
          <span className="placeholder-leaf placeholder-leaf-one" />
          <span className="placeholder-leaf placeholder-leaf-two" />
          <span className="placeholder-label">{label}</span>
        </div>
      )}
    </div>
  );
}

function Brand({
  language,
  onClick,
}: {
  language: Language;
  onClick: () => void;
}) {
  const isArabic = language === "ar";

  return (
    <button className="brand" type="button" onClick={onClick}>
      {siteAssets.logo ? (
        <Image
          className="brand-logo-image"
          src={siteAssets.logo}
          alt={translations[language].logoAlt}
          width={164}
          height={112}
        />
      ) : (
        <>
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <span className="brand-name">{isArabic ? "جود" : "Joud"}</span>
          <span className="brand-caption">SPA · WELLNESS</span>
        </>
      )}
    </button>
  );
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Home() {
  const language = useSyncExternalStore<Language>(
    subscribeToLanguage,
    getLanguageSnapshot,
    () => "ar",
  );
  const [screen, setScreen] = useState<Screen>("welcome");
  const [branch, setBranch] = useState<Branch>("riyadh");
  const [serviceTab, setServiceTab] = useState<ServiceTab>("individual");
  const [specialist, setSpecialist] = useState("sara");
  const [bookingProduct, setBookingProduct] = useState<BookingProduct>("relaxation");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [today, setToday] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date | null>(null);
  const [bookingReady, setBookingReady] = useState(false);
  const text = translations[language];
  const isArabic = language === "ar";
  const bookingProductName: Record<BookingProduct, string> = {
    quiet: text.quietPackage,
    relaxation: text.relaxationPackage,
    massage: text.serviceMassage,
    skin: text.serviceSkin,
    foot: text.serviceFoot,
  };
  const bookingProductImage: Record<BookingProduct, ImageName> = {
    quiet: "packageQuiet",
    relaxation: "packageRelaxation",
    massage: "serviceMassage",
    skin: "serviceSkin",
    foot: "serviceFoot",
  };
  const bookingProductType =
    bookingProduct === "quiet" || bookingProduct === "relaxation"
      ? text.packageLabel
      : text.individualSessions;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [isArabic, language]);

  function navigate(nextScreen: Screen) {
    if (nextScreen === "booking" && !today) {
      const currentDate = new Date();
      setToday(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
        ),
      );
      setMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    }
    setScreen(nextScreen);
    setBookingReady(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeLanguage() {
    saveLanguage(isArabic ? "en" : "ar");
  }

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
    ? new Intl.DateTimeFormat(
    isArabic ? "ar-SA-u-ca-gregory" : "en-US",
    { month: "long", year: "numeric" },
      ).format(month)
    : "";
  const selectedDateLabel = selectedDate
    ? new Intl.DateTimeFormat(isArabic ? "ar-SA-u-ca-gregory" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${selectedDate}T12:00:00`))
    : text.noDate;

  function changeMonth(amount: number) {
    setMonth((current) =>
      current
        ? new Date(current.getFullYear(), current.getMonth() + amount, 1)
        : current,
    );
  }

  const serviceEntries = [
    {
      image: "serviceMassage" as const,
      title: text.serviceMassage,
      kind: "individual" as const,
    },
    {
      image: "serviceSkin" as const,
      title: text.serviceSkin,
      kind: "individual" as const,
    },
    {
      image: "serviceFoot" as const,
      title: text.serviceFoot,
      kind: "individual" as const,
    },
  ];

  const packageEntries = [
    {
      id: "quiet" as const,
      image: "packageQuiet" as const,
      title: text.quietPackage,
      count: text.sessionsThree,
    },
    {
      id: "relaxation" as const,
      image: "packageRelaxation" as const,
      title: text.relaxationPackage,
      count: text.ninetyMinutes,
    },
  ];

  return (
    <main className="app-shell" dir={isArabic ? "rtl" : "ltr"}>
      <header className={`site-header${screen === "welcome" ? " welcome-header" : ""}`}>
        <Brand language={language} onClick={() => navigate("home")} />

        <nav className="main-nav" aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}>
          <button
            className={`nav-link${screen === "home" ? " active" : ""}`}
            type="button"
            onClick={() => navigate("home")}
          >
            {text.home}
          </button>
          <button
            className={`nav-link${screen === "services" ? " active" : ""}`}
            type="button"
            onClick={() => {
              setServiceTab("individual");
              navigate("services");
            }}
          >
            {text.services}
          </button>
          <button
            className={`nav-link${screen === "package" ? " active" : ""}`}
            type="button"
            onClick={() => {
              setServiceTab("packages");
              navigate("services");
            }}
          >
            {text.packages}
          </button>
          <button
            className={`nav-link${screen === "booking" ? " active" : ""}`}
            type="button"
            onClick={() => navigate("booking")}
          >
            {text.bookings}
          </button>
        </nav>

        <div className="header-actions">
          <button
            className="header-branch"
            type="button"
            onClick={() => navigate("welcome")}
            aria-label={isArabic ? "تغيير الفرع" : "Change branch"}
          >
            <Icon name="location" />
            <span>{text.branches[branch]}</span>
          </button>
          <span className="header-divider" aria-hidden="true" />
          <button
            className="language-switch"
            type="button"
            onClick={changeLanguage}
            aria-label={isArabic ? "Switch language to English" : "تغيير اللغة إلى العربية"}
          >
            <Icon name="globe" />
            <span>{text.language}</span>
          </button>
          <span className="header-design-icons" aria-hidden="true">
            <Icon name="user" />
            <Icon name="cart" />
          </span>
        </div>
      </header>

      {screen === "welcome" && (
        <section className="welcome-screen">
          <div className="welcome-grid">
            <div className="welcome-visual">
              {siteAssets.welcomeVideo ? (
                <video
                  className="welcome-video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={isArabic ? "فيديو جود سبا" : "Joud Spa animation"}
                >
                  <source src={siteAssets.welcomeVideo} type="video/mp4" />
                </video>
              ) : (
                <ImagePlaceholder
                  name="welcome"
                  label={text.photoPlaceholder}
                  className="welcome-image-placeholder"
                />
              )}
            </div>

            <div className="welcome-copy">
              <p className="eyebrow">
                <span className="eyebrow-line" />
                {text.welcomeEyebrow}
              </p>
              <h1>{text.welcomeTitle}</h1>
              <p className="welcome-subtitle">{text.welcomeSubtitle}</p>
              <p className="welcome-description">{text.welcomeDescription}</p>

              <div className="branch-select">
                <p className="field-label">{text.chooseBranchHint}</p>
                <div className="branch-options" role="group" aria-label={text.chooseBranch}>
                  {branches.map((item) => (
                    <button
                      className={`branch-option${branch === item ? " selected" : ""}`}
                      key={item}
                      type="button"
                      aria-pressed={branch === item}
                      onClick={() => setBranch(item)}
                    >
                      {text.branches[item]}
                    </button>
                  ))}
                </div>
              </div>

              <button className="button button-primary welcome-cta" onClick={() => navigate("home")}>
                <span>{text.continue}</span>
                <Icon name="arrow" />
              </button>
            </div>
          </div>
        </section>
      )}

      {screen === "home" && (
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
                <button className="button button-primary" onClick={() => navigate("booking")}>
                  {text.bookSession}
                  <Icon name="arrow" />
                </button>
                <button
                  className="text-link"
                  onClick={() => {
                    setServiceTab("individual");
                    navigate("services");
                  }}
                >
                  {text.exploreServices}
                </button>
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
              <button className="discover-card" onClick={() => navigate("services")}>
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
              </button>
              <button
                className="discover-card"
                onClick={() => {
                  setServiceTab("packages");
                  navigate("services");
                }}
              >
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
              </button>
            </div>
          </section>
        </>
      )}

      {screen === "services" && (
        <section className="page-section services-screen">
          <div className="page-heading">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              {text.servicesEyebrow}
            </p>
            <h1>{text.servicesTitle}</h1>
            <div className="service-tabs" role="tablist">
              <button
                className={`service-tab${serviceTab === "individual" ? " active" : ""}`}
                type="button"
                role="tab"
                aria-selected={serviceTab === "individual"}
                onClick={() => setServiceTab("individual")}
              >
                {text.individualTab}
              </button>
              <button
                className={`service-tab${serviceTab === "packages" ? " active" : ""}`}
                type="button"
                role="tab"
                aria-selected={serviceTab === "packages"}
                onClick={() => setServiceTab("packages")}
              >
                {text.packagesTab}
              </button>
            </div>
          </div>

          {serviceTab === "individual" ? (
            <div className="catalog-grid">
              {serviceEntries.map((service) => (
                <article className="catalog-card" key={service.image}>
                  <ImagePlaceholder
                    name={service.image}
                    label={text.photoPlaceholder}
                    className="catalog-visual"
                  />
                  <div className="catalog-info">
                    <div>
                      <p className="catalog-kicker">{text.individualSessions}</p>
                      <h2>{service.title}</h2>
                      <p className="catalog-price">{text.priceLater}</p>
                    </div>
                    <button
                      className="button button-outline"
                      type="button"
                      onClick={() => {
                        setBookingProduct(
                          service.image === "serviceMassage"
                            ? "massage"
                            : service.image === "serviceSkin"
                              ? "skin"
                              : "foot",
                        );
                        navigate("booking");
                      }}
                    >
                      {text.bookSession}
                      <Icon name="arrow" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="catalog-grid package-grid">
              {packageEntries.map((item) => (
                <article className="catalog-card" key={item.image}>
                  <ImagePlaceholder
                    name={item.image}
                    label={text.photoPlaceholder}
                    className="catalog-visual"
                  />
                  <div className="catalog-info">
                    <div>
                      <p className="catalog-kicker">{text.packagesTab}</p>
                      <h2>{item.title}</h2>
                      <p className="catalog-subline">{item.count}</p>
                      <p className="catalog-price">{text.priceLater}</p>
                    </div>
                    <button
                      className="button button-outline"
                      type="button"
                      onClick={() => {
                        setBookingProduct(item.id);
                        navigate("package");
                      }}
                    >
                      {text.details}
                      <Icon name="arrow" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {screen === "package" && (
        <section className="page-section package-screen">
          <div className="package-feature">
            <ImagePlaceholder
              name="packageQuiet"
              label={text.photoPlaceholder}
              className="package-photo"
            />
            <div className="package-content">
              <p className="eyebrow">
                <span className="eyebrow-line" />
                {text.packageEyebrow}
              </p>
              <h1>
                {bookingProduct === "quiet" ? text.quietPackage : text.relaxationPackage}
              </h1>
              <p className="package-description">{text.packageDescription}</p>
              <h2 className="included-heading">{text.includedServices}</h2>
              <ul className="included-list">
                {[text.serviceMassage, text.serviceSkin, text.serviceFoot, text.serviceHospitality].map(
                  (service) => (
                    <li key={service}>
                      <Icon name="check" />
                      {service}
                    </li>
                  ),
                )}
              </ul>
              <div className="package-facts">
                <div>
                  <strong>
                    {bookingProduct === "quiet" ? text.sessionsThree : text.unknownSessions}
                  </strong>
                  <span>{text.sessionCount}</span>
                </div>
                <div>
                  <strong>
                    {bookingProduct === "quiet" ? text.sixtyMinutes : text.ninetyMinutes}
                  </strong>
                  <span>{text.sessionDuration}</span>
                </div>
                <div>
                  <strong>
                    {bookingProduct === "quiet" ? text.thirtyDays : text.unknownValidity}
                  </strong>
                  <span>{text.packageValidity}</span>
                </div>
                <div>
                  <strong>{text.priceLater}</strong>
                  <span>{text.price}</span>
                </div>
              </div>
              <p className="package-notice">
                <Icon name="lock" />
                {text.packageNotice}
              </p>
              <button className="button button-primary package-cta" onClick={() => navigate("booking")}>
                {text.bookPackage}
                <Icon name="arrow" />
              </button>
            </div>
          </div>
        </section>
      )}

      {screen === "booking" && (
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
                    { id: "sara", image: "specialistSara" as const, label: text.specialistSara },
                    { id: "noura", image: "specialistNoura" as const, label: text.specialistNoura },
                    { id: "maryam", image: "specialistMaryam" as const, label: text.specialistMaryam },
                  ].map((person) => (
                    <button
                      className={`specialist-card${specialist === person.id ? " selected" : ""}`}
                      key={person.id}
                      type="button"
                      aria-pressed={specialist === person.id}
                      onClick={() => setSpecialist(person.id)}
                    >
                      <ImagePlaceholder
                        name={person.image}
                        label={person.label}
                        className="specialist-photo"
                      />
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
                              setSelectedDate(dateKey);
                              setSelectedTime("");
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
                            setSelectedTime(time);
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
              <div className="summary-package">
                <ImagePlaceholder
                  name={bookingProductImage[bookingProduct]}
                  label={text.photoPlaceholder}
                  className="summary-photo"
                />
                <div>
                  <span>{bookingProductType}</span>
                  <strong>{bookingProductName[bookingProduct]}</strong>
                  <small>
                    {bookingProduct === "quiet"
                      ? text.sixtyMinutes
                      : bookingProduct === "relaxation"
                        ? text.durationNinety
                        : text.individualSession}
                  </small>
                </div>
              </div>
              <div className="summary-row">
                <span>{text.specialistLabel}</span>
                <strong>
                  {specialist === "sara"
                    ? text.specialistSara
                    : specialist === "noura"
                      ? text.specialistNoura
                      : text.specialistMaryam}
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
              <div className="summary-price">
                <span>{text.price}</span>
                <strong>{text.priceLater}</strong>
              </div>
              <button
                className="button button-primary summary-cta"
                type="button"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setBookingReady(true)}
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
        </section>
      )}

      {screen !== "welcome" && (
        <footer className="site-footer">
          <Brand language={language} onClick={() => navigate("home")} />
          <span className="footer-message">{text.footerLine}</span>
          <span className="copyright">© JOUD SPA</span>
          <div className="footer-links">
            <button type="button" onClick={() => navigate("home")}>{text.home}</button>
            <button type="button" onClick={() => navigate("services")}>{text.services}</button>
            <button type="button" onClick={() => navigate("booking")}>{text.bookings}</button>
          </div>
        </footer>
      )}
    </main>
  );
}
