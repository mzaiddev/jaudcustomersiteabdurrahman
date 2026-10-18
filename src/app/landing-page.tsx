"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon, SilkCanvas } from "./components";
import { siteAssets } from "./site-assets";
import { branches, landingCopy } from "./site-data";
import { Logo, useLanguage } from "./site-ui";

export function LandingPage() {
  const { language, isArabic, text, toggleLanguage } = useLanguage();
  const copy = landingCopy[language];

  return (
    <div className="landing-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="landing-hero" id="landing-top">
        <video
          className="landing-hero-video"
          src={siteAssets.welcomeVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="landing-hero-wash" aria-hidden="true" />
        <header className="landing-header">
          <button
            className="landing-language"
            type="button"
            onClick={toggleLanguage}
            aria-label={isArabic ? "Switch language to English" : "تغيير اللغة إلى العربية"}
          >
            {text.language}
          </button>
          <nav
            className="landing-nav"
            dir={isArabic ? "rtl" : "ltr"}
            aria-label={isArabic ? "القائمة الرئيسية" : "Main navigation"}
          >
            <a href="#landing-about">{copy.aboutNav}</a>
            <a href="#landing-faq">{copy.faqNav}</a>
            <a href="#landing-contact">{copy.contactNav}</a>
            <button
              className="landing-profile-unavailable"
              type="button"
              disabled
              title={text.profileUnavailable}
            >
              {text.profile}
            </button>
          </nav>
          <a className="landing-brand" href="#landing-top" aria-label={text.logoAlt}>
            <Logo priority />
          </a>
        </header>

        <div className="landing-hero-content">
          <Image
            className="landing-hero-wordmark"
            src={siteAssets.logo}
            alt={text.logoAlt}
            width={590}
            height={420}
            priority
          />
          <h1>{copy.heroTitle}</h1>
          <p className="landing-hero-description">{copy.heroDescription}</p>
          <div className="landing-branch-grid" role="group" aria-label={text.chooseBranch}>
            {branches.map((item) => (
              <Link className="landing-branch" key={item} href={`/${item}`}>
                <span>{text.branches[item]}</span>
                <small>{copy.branchNames[item]}</small>
                <Icon name="arrow" />
              </Link>
            ))}
          </div>
          <p className="landing-hero-tagline">{copy.heroTagline}</p>
        </div>
      </section>

      <section className="landing-about" id="landing-about">
        <div className="landing-section-inner landing-about-layout">
          <div className="landing-about-copy">
            <p className="landing-eyebrow">{copy.aboutEyebrow}</p>
            <h2>{copy.aboutTitle}</h2>
            {copy.aboutParagraphs.map((paragraph) => (
              <p className="landing-body-copy" key={paragraph}>{paragraph}</p>
            ))}
            <span className="landing-signature">Where Wellness Comes Home</span>
          </div>
          <div className="landing-about-photo">
            <Image
              src="/aljoudi-about-reference.jpg"
              alt={copy.aboutImageAlt}
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="landing-experience">
        <div className="landing-section-inner">
          <div className="landing-centered-heading">
            <p className="landing-eyebrow">{copy.experienceEyebrow}</p>
            <h2>{copy.experienceTitle}</h2>
          </div>
          <div className="landing-experience-grid">
            {copy.experienceItems.map(([title, description], index) => (
              <article className="landing-experience-card" key={title}>
                <span className="landing-experience-icon" aria-hidden="true">
                  <Icon name={index === 0 ? "home" : index === 1 ? "calendar" : "clock"} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-story">
        <SilkCanvas className="landing-story-image" src="/green-silk.jpg" />
        <div className="landing-story-shade" aria-hidden="true" />
        <div className="landing-story-content">
          <Image src={siteAssets.logo} alt={text.logoAlt} width={590} height={420} />
          <h2>{copy.storyTitle}</h2>
          <p>{copy.storyDescription}</p>
        </div>
      </section>

      <section className="landing-journey">
        <div className="landing-section-inner">
          <div className="landing-journey-heading">
            <div>
              <p className="landing-eyebrow">{copy.journeyEyebrow}</p>
              <h2>{copy.journeyTitle}</h2>
            </div>
            <p>{copy.journeyDescription}</p>
          </div>
          <div className="landing-journey-grid">
            {copy.journeyItems.map(([title, description], index) => (
              <article className="landing-journey-step" key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-faq" id="landing-faq">
        <div className="landing-section-inner landing-faq-layout">
          <div className="landing-faq-heading">
            <p className="landing-eyebrow">{copy.faqEyebrow}</p>
            <h2>{copy.faqTitle}</h2>
            <p>{copy.faqDescription}</p>
          </div>
          <div className="landing-faq-list">
            {copy.faqItems.map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-contact" id="landing-contact">
        <p className="landing-eyebrow">{copy.contactEyebrow}</p>
        <h2>{copy.contactTitle}</h2>
        <p>{copy.contactDescription}</p>
        <div className="landing-contact-actions">
          <a
            href="https://wa.me/966554508557"
            className="landing-contact-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.contactAction}
          </a>
          <a href="#landing-top">
            {copy.chooseBranchAction}
            <Icon name="arrow" />
          </a>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-top">
          <div className="landing-footer-brand">
            <a href="#landing-top" aria-label={text.logoAlt}>
              <Logo />
            </a>
            <p>{copy.footerTagline}</p>
          </div>
          <nav className="landing-footer-nav" aria-label={isArabic ? "روابط الصفحة" : "Page links"}>
            <a href="#landing-about">{copy.aboutNav}</a>
            <a href="#landing-faq">{copy.faqNav}</a>
            <a href="#landing-contact">{copy.contactNav}</a>
            <a href="#landing-top">{isArabic ? "ابدئي الحجز" : "Start booking"}</a>
          </nav>
          <div className="landing-social">
            <h3>{copy.footerFollow}</h3>
            <div>
              {copy.socialLinks.map((link) => <span key={link}>{link}</span>)}
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>{copy.footerCopyright}</span>
          <span>{text.branches.khobar} · {text.branches.riyadh} · {text.branches.jazan}</span>
        </div>
      </footer>
    </div>
  );
}
