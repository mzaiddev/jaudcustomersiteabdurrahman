"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { authHref, useAuth } from "./auth";
import { Icon } from "./components";
import { NotificationBell, NotificationToaster } from "./notifications";
import { useFlow } from "./flow-ui";
import { BRANCH_KEY, writeStored } from "./storage";
import { Brand, useBranch } from "./site-ui";

function AccountMenu({ base }: { base: string }) {
  const branch = useBranch();
  const pathname = usePathname();
  const { t, dir } = useFlow();
  const { customer, ready, logout } = useAuth();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (value: boolean) => setOpenAt(value ? pathname : null);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setOpen(false);
      } else if (wrapper.current && !wrapper.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (ready && !customer) {
    return (
      <Link className="header-signin" href={authHref(branch, pathname === `${base}/auth` ? `${base}/account/bookings` : pathname)}>
        <Icon name="user" />
        <span>{t.signIn}</span>
      </Link>
    );
  }

  return (
    <div className="account-menu" ref={wrapper} dir={dir}>
      <button
        className="header-signin"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.accountMenu}
        onClick={() => setOpen(!open)}
      >
        <Icon name="user" />
        <span>{customer ? customer.name.split(" ")[0] : t.account}</span>
      </button>
      {open && customer && (
        <div className="account-menu-panel" role="menu">
          <p className="account-menu-name">
            <strong>{customer.name}</strong>
            <bdi dir="ltr">{customer.phone}</bdi>
          </p>
          <Link role="menuitem" href={`${base}/account/bookings`}>{t.myBookings}</Link>
          <Link role="menuitem" href={`${base}/account/packages`}>{t.myPackages}</Link>
          <Link role="menuitem" href={`${base}/account/addresses`}>{t.myAddresses}</Link>
          <Link role="menuitem" href={`${base}/account/profile`}>{t.myProfile}</Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            {t.signOut}
          </button>
        </div>
      )}
    </div>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const branch = useBranch();
  const pathname = usePathname();
  const { isArabic, text, t, toggleLanguage } = useFlow();
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
          <Link className={`nav-link${isActive(`${base}/account`) ? " active" : ""}`} href={`${base}/account/bookings`}>
            {text.bookings}
          </Link>
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
          <NotificationBell base={base} />
          <AccountMenu base={base} />
          <Link className="header-icon-link" href={`${base}/account/packages`} aria-label={t.packagesShortcut} title={t.packagesShortcut}>
            <Icon name="cart" />
          </Link>
        </div>
      </header>

      {children}

      <NotificationToaster />

      <footer className="site-footer">
        <Brand href={base} />
        <span className="footer-message">{text.footerLine}</span>
        <span className="copyright">© ALJOUDI WELLNESS SPA</span>
        <div className="footer-links">
          <Link href={base}>{text.home}</Link>
          <Link href={`${base}/services`}>{text.services}</Link>
          <Link href={`${base}/account/bookings`}>{text.bookings}</Link>
        </div>
      </footer>
    </main>
  );
}
