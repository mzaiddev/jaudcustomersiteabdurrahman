"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { Icon } from "./components";
import { BRANCH_KEY, writeStored } from "./storage";
import { productCatalogue } from "./product-catalogue";
import { siteAssets } from "./site-assets";
import {
  getLanguageSnapshot,
  isBranch,
  journeyCopy,
  saveLanguage,
  subscribeToLanguage,
  translations,
  type Branch,
  type Language,
} from "./site-data";

export function useLanguage() {
  const language = useSyncExternalStore<Language>(
    subscribeToLanguage,
    getLanguageSnapshot,
    () => "ar",
  );
  const isArabic = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [isArabic, language]);

  return {
    language,
    isArabic,
    text: translations[language],
    toggleLanguage: () => saveLanguage(isArabic ? "en" : "ar"),
  };
}

export function useBranch(): Branch {
  const params = useParams<{ branch: string }>();

  if (!isBranch(params.branch)) notFound();
  return params.branch;
}

export function formatPrice(price: number, language: Language) {
  return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function useProducts(branch: Branch) {
  const { language, isArabic, text } = useLanguage();
  const formatNumber = (value: number) =>
    new Intl.NumberFormat(isArabic ? "ar-SA" : "en").format(value);

  const entries = productCatalogue
    .filter((product) => !product.riyadhOnly || branch === "riyadh")
    .map((product) => {
      const count = product.pendingTypes
        ? `${formatNumber(product.sessions)} ${text.sessions}`
        : product.repeat
          ? product.group
            ? isArabic
              ? `${formatNumber(product.sessions)} مواعيد للزوجين`
              : `${formatNumber(product.sessions)} couples appointments`
            : `${formatNumber(product.sessions)} ${text.sessions}`
          : product.group
            ? product.id === "friends"
              ? isArabic
                ? "٣ صديقات · قابلة للإضافة"
                : "3 friends · extra guests available"
              : isArabic
                ? "شخصان في موعد واحد"
                : "Two guests in one booking"
            : text.individualSession;
      const duration = product.pendingTypes
        ? isArabic
          ? "حسب نوع المساج المختار"
          : "Depends on the selected massage"
        : `${formatNumber(product.minutes)} ${isArabic ? "دقيقة" : "minutes"}${product.group ? (isArabic ? " لكل شخص" : " per guest") : ""}`;

      return {
        ...product,
        title: product.name[language],
        description: product.description[language],
        facts: product.facts[language],
        count,
        duration,
        priceLabel: formatPrice(product.price, language),
      };
    });

  return {
    entries,
    services: entries.filter((product) => product.kind === "service"),
    packages: entries.filter((product) => product.kind === "package"),
  };
}

export type ProductEntry = ReturnType<typeof useProducts>["entries"][number];

/** The one logo used across the whole site. */
export function Logo({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  const { text } = useLanguage();

  return (
    <Image
      className={`brand-logo-image ${className}`}
      src={siteAssets.logoMark}
      alt={text.logoAlt}
      width={164}
      height={112}
      priority={priority}
    />
  );
}

export function Brand({ href }: { href: string }) {
  return (
    <Link className="brand brand-with-logo" href={href}>
      <Logo />
    </Link>
  );
}

export function JourneyBreadcrumbs({
  branch,
  productName,
  catalogueHref,
}: {
  branch: Branch;
  productName?: string;
  catalogueHref: string;
}) {
  const { language, text } = useLanguage();
  const copy = journeyCopy[language];

  return (
    <nav className="journey-breadcrumb" aria-label={language === "ar" ? "مسار الصفحة" : "Breadcrumb"}>
      <Link href="/">{copy.branchesCrumb}</Link>
      <span aria-hidden="true">/</span>
      <Link href={catalogueHref}>{text.branches[branch]}</Link>
      {productName && (
        <>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{productName}</span>
        </>
      )}
    </nav>
  );
}

export function ProductCareInfo() {
  const { language } = useLanguage();
  const copy = journeyCopy[language];

  return (
    <div className="product-care-info">
      <details>
        <summary>{copy.addOnsTitle}</summary>
        <p>{copy.addOnsDescription}</p>
        <ul>
          {copy.addOns.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p>{copy.addOnPrice}</p>
      </details>
      <details>
        <summary>{copy.careGuidanceTitle}</summary>
        <h3>{copy.beforeSession}</h3>
        <ul>
          {copy.beforeCare.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <h3>{copy.afterSession}</h3>
        <ul>
          {copy.afterCare.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </details>
    </div>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const branch = useBranch();
  const pathname = usePathname();
  const { isArabic, text, toggleLanguage } = useLanguage();
  const base = `/${branch}`;
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  useEffect(() => {
    writeStored(BRANCH_KEY, branch);
  }, [branch]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <main className="app-shell" dir={isArabic ? "rtl" : "ltr"}>
      <header className="site-header">
        <Brand href={base} />

        <nav
          className="main-nav"
          dir={isArabic ? "rtl" : "ltr"}
          aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}
        >
          <Link className={`nav-link${pathname === base ? " active" : ""}`} href={base}>
            {text.home}
          </Link>
          <Link className={`nav-link${isActive(`${base}/services`) ? " active" : ""}`} href={`${base}/services`}>
            {text.services}
          </Link>
          <Link className={`nav-link${isActive(`${base}/packages`) ? " active" : ""}`} href={`${base}/packages`}>
            {text.packages}
          </Link>
          <button
            className="nav-link nav-link-unavailable"
            type="button"
            disabled
            title={text.profileUnavailable}
          >
            {text.profile}
          </button>
        </nav>

        <div className="header-actions" dir={isArabic ? "rtl" : "ltr"}>
          <Link
            className="header-branch"
            href="/"
            aria-label={isArabic ? "تغيير الفرع" : "Change branch"}
          >
            <Icon name="location" />
            <span>{text.branches[branch]}</span>
          </Link>
          <span className="header-divider" aria-hidden="true" />
          <button
            className="language-switch"
            type="button"
            onClick={toggleLanguage}
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

      {children}

      <footer className="site-footer">
        <Brand href={base} />
        <span className="footer-message">{text.footerLine}</span>
        <span className="copyright">© ALJOUDI SPA</span>
        <div className="footer-links">
          <Link href={base}>{text.home}</Link>
          <Link href={`${base}/services`}>{text.services}</Link>
          <Link href={`${base}/booking`}>{text.bookings}</Link>
        </div>
      </footer>
    </main>
  );
}
