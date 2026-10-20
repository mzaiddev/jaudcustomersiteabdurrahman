"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Icon, ImagePlaceholder } from "./components";
import { productPhotos, type ProductKind } from "./product-catalogue";
import { journeyCopy } from "./site-data";
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
              <Link className="button button-primary" href={`${base}/services`}>
                {text.bookSession}
                <Icon name="arrow" />
              </Link>
              <Link className="text-link" href={`${base}/services`}>
                {text.exploreServices}
              </Link>
            </div>
          </div>
          <ImagePlaceholder name="home" label={text.homeImageAlt} className="home-visual" />
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
                label={text.individualImageAlt}
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
                label={text.packagesImageAlt}
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
          <Link className="button button-primary package-cta" href={`${base}/book/${product.id}`}>
            {isPackage ? (product.repeat ? copy.bookFirst : copy.bookVisit) : copy.bookNow}
            <Icon name="arrow" />
          </Link>
        </div>
      </div>
      <ProductCareInfo />
      <PreviewNotice />
    </section>
  );
}
