"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { siteAssets } from "./site-assets";
import type { IconName, ImageName } from "./site-data";

export function Icon({
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
    bell: (
      <>
        <path d="M5 14V9a5 5 0 0 1 10 0v5l1.5 2h-13L5 14Z" />
        <path d="M8.5 17.5a1.6 1.6 0 0 0 3 0" />
      </>
    ),
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

export function ImagePlaceholder({
  name,
  label,
  className = "",
  placeholderOnly = false,
  src,
}: {
  name: ImageName;
  label: string;
  className?: string;
  placeholderOnly?: boolean;
  src?: string;
}) {
  const source = src ?? siteAssets.images[name];
  const isIconArtwork = name === "serviceSkin" || name === "serviceFoot";

  return (
    <div
      className={`image-frame${isIconArtwork ? " icon-art-frame" : ""} ${className}`}
      style={name === "welcome" ? { position: "absolute", inset: 0 } : undefined}
    >
      {source && !placeholderOnly ? (
        <Image
          className={`frame-image${isIconArtwork ? " frame-icon-art" : ""}`}
          src={source}
          alt={isIconArtwork ? "" : label}
          aria-hidden={isIconArtwork ? true : undefined}
          fill
          quality={name === "home" ? 90 : undefined}
          preload={name === "home"}
          sizes={
            name === "home"
              ? "100vw"
              : "(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 40vw"
          }
        />
      ) : (
        <div
          className={`image-placeholder${placeholderOnly ? " reference-image-placeholder" : ""}`}
          role="img"
          aria-label={label}
        >
          {!placeholderOnly && (
            <>
              <span className="placeholder-orb" />
              <span className="placeholder-leaf placeholder-leaf-one" />
              <span className="placeholder-leaf placeholder-leaf-two" />
            </>
          )}
          {placeholderOnly && <span className="reference-placeholder-mark" aria-hidden="true">+</span>}
          <span className="placeholder-label">{label}</span>
        </div>
      )}
    </div>
  );
}

/** Animated silk band: the image is drawn in thin strips that ripple sideways. */
export function SilkCanvas({
  src,
  base = "#2c5f2d",
  className = "",
}: {
  src: string;
  base?: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    const parent = canvas?.parentElement;
    if (!canvas || !ctx || !parent) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const image = new window.Image();
    image.src = src;
    let w = 0;
    let h = 0;
    let frame = 0;

    const observer = new ResizeObserver(() => {
      w = canvas.width = parent.clientWidth;
      h = canvas.height = parent.clientHeight;
    });
    observer.observe(parent);

    function draw(ms: number) {
      if (ctx && image.complete && image.naturalWidth && w) {
        const t = reduce ? 0 : ms * 0.00022;
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 4) {
          const dx = reduce ? 0 : Math.sin((y / h) * 5 + t) * 10 + Math.sin((y / h) * 9 - t * 0.7) * 4;
          ctx.drawImage(image, 0, (y / h) * image.height, image.width, (4 / h) * image.height, -25 + dx, y, w + 50, 4.5);
        }
      }
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [src, base]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
