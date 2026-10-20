# AlJoudi Spa

An Arabic-first, responsive website experience for AlJoudi Spa (الجودي سبا), with an English-language option. The interface is based on the shared Canva design and introduces visitors to the spa, its treatments and packages, and an appointment-booking flow.

> **Project status:** Front-end prototype running on a mock engine. Sign-in, bookings, packages and payments are fully simulated and stored in the browser (`localStorage`); there is no backend or real payment. See `docs/customer-contract.md` for how the mock maps to a real API and the admin app.

## Design reference

The visual direction is based on the [AlJoudi Spa Canva design](https://www.canva.com/design/DAHYGBJ2drk/TBgz56UviuG52rMOBfmGDA/view).

## Features

- Arabic and English interface with right-to-left and left-to-right layouts.
- Responsive layouts for desktop, tablet, and mobile viewports.
- Welcome and branch-selection screen for Riyadh, Jazan, and Khobar.
- Home page with links to treatments and packages.
- Treatment catalog and package listings.
- Reference-styled, bilingual session/package catalogues with branch breadcrumbs.
- Individual-session and package detail views with booking actions, add-ons, and before/after care guidance.
- The 16 individual sessions and packages use the reference catalogue's listed prices, descriptions, durations, and group terms; VIP detox products are shown for Riyadh only.
- Product image placeholders in catalogue and detail views for project-owned photography.
- Phone-number sign-in and registration with a mock OTP (any 4–6 digit code). Booking requires an account.
- Booking flow: visit address, guests and add-ons, specialist and computed time slots (schedules, leaves, travel gaps), review and mock payment (Mada, card, Apple Pay, pay later with a 10-minute hold).
- Package purchase with its first visit, remaining-session booking, and per-package session history.
- Confirmation page with reference number and calendar (.ics) download.
- Account area: bookings (upcoming, past, cancelled) with cancel and reschedule, packages, saved addresses and profile.
- Data model and rules mirror the admin app so bookings made here appear correctly in the admin.
- Language preference saved in browser local storage.
- Brand and design images served locally from `public/`.

## Technology

- [Next.js](https://nextjs.org/) 16 App Router
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4 tooling, with the application styles in `src/app/globals.css` and `src/app/flow.css` and `src/app/flow.css`
- [ESLint](https://eslint.org/) 9
- Noto Sans Arabic and Geist Mono via `next/font/google`

## Requirements

- Node.js 20.9 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser. The development server reloads the app when source files change.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build locally; run `npm run build` first. |

## Project structure

```text
.
├── public/                 # Logo, Canva artwork, and other static assets
├── src/
│   └── app/
│       ├── globals.css     # Global styles and responsive layouts
│       ├── layout.tsx      # Root layout, fonts, and page metadata
│       ├── page.tsx        # Website screens and client-side interactions
│       ├── product-catalogue.ts # Localized catalogue facts, pricing, and product terms
│       └── site-assets.ts  # Central asset registry
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Updating brand assets

Add approved image files to `public/`, then update the corresponding path in [`src/app/site-assets.ts`](./src/app/site-assets.ts). The asset registry centralizes the logo, icons, welcome/home artwork, treatment and package imagery, and specialist portraits.

Use root-relative public paths, for example:

```ts
logo: "/aljoudi-brand-reference.svg",
logoMark: "/aljoudi-mark.png",
images: {
  welcome: "/welcome-canva.png",
  home: "/home-hero-canva.png",
  // ...
},
```

Some images available from the Canva design were only downloadable as small thumbnails and may appear soft when enlarged. Review the image quality and usage permissions before publishing the repository publicly or using the assets in a production service.

## Production and integrations

The current booking flow is a presentation prototype. Before using it to accept real appointments, connect it to a booking service and implement server-side availability validation, reservation handling, and any required payment integration. Configure production environment variables through the hosting provider rather than committing secrets to the repository.

No deployment target is configured in this repository. It can be deployed to a Next.js-compatible hosting provider after the required production integrations and client-approved assets are in place.

## License and asset rights

No software license is currently specified. Obtain the project owner's approval and add the appropriate license before granting reuse rights. Brand and Canva-supplied assets may have separate ownership or usage terms; confirm those permissions before public distribution.
