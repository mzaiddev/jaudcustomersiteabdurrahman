# Customer app contract (mock → real backend)

The customer app runs on a mock engine (`src/app/mock-engine.ts`) that persists to `localStorage`
under the key `joud-db`. Every function in that file is the seam for a real endpoint. Data shapes live
in `src/app/types.ts` and mirror the admin app (`admin/jaud-admin/src/api/types.ts`), so anything the
customer app creates already renders in the admin's Today, Bookings, Customers, Packages and Payments
screens.

Money is SAR in major units, VAT-inclusive. Times are ISO 8601 with offset (`Asia/Riyadh`).
Shared rules are in `src/app/rules.ts` (same values as the admin's `RULES`).

## Engine function → endpoint

| Mock function | Suggested endpoint | Notes |
| --- | --- | --- |
| `sendOtp(phone)` | `POST /auth/otp` | Phone normalised to `+9665xxxxxxxx`. |
| `verifyOtp(phone, code)` | `POST /auth/otp/verify` | Returns the customer, or `null` for a new phone. Mock accepts any 4–6 digits. |
| `registerCustomer` | `POST /auth/register` | Phone is the unique key (`DUPLICATE_PHONE` on clash). |
| `updateProfile` | `PATCH /me` | Name, email. Phone is read-only. |
| `saveAddress` / `deleteAddress` | `PUT /me/addresses/:id`, `DELETE …` | District and street required. Coverage radius checked when `lat/lng` is present (`OUT_OF_COVERAGE`). |
| `computeSlots` | `GET /slots?locationId&serviceId|packageId&date&guests&extraMinutes` | Same algorithm as the admin's `computeSlots`. |
| `createBooking` | `POST /me/bookings` | Creates a `pending` booking (and a `pending` entitlement for a new package). |
| `payBooking` | payment gateway + webhook | Webhook confirms the booking, creates the `Payment`, and marks the entitlement `paid`. |
| `cancelBooking` | `POST /me/bookings/:id/cancel` | Reason required. Blocked inside 24 h for confirmed bookings. |
| `rescheduleBooking` | `POST /me/bookings/:id/reschedule` | Reason required. Re-runs slot check with `excludeBookingId`. |
| `customerBookings`, `customerEntitlements`, `entitlementBookings` | `GET /me/bookings`, `GET /me/packages` | Session history is the entitlement ledger joined with its bookings. |

## What the admin reads from a customer booking

- `ref` (`BK-xxxx`), `source: "online"`, `status`, `paymentStatus`.
- `customer {name, phone}` and `address` snapshots (district and street are required, `building`, `notes`, `lat/lng` optional).
- `startsAt` / `endsAt`, `specialistId`, `guests`, `serviceId` or `packageId` (+ `entitlementId`).
- `price`: the service price, or `0` for any package visit. The package price lives on the `Entitlement`.
- `history[0] = {action: "created", by: "Customer (website)", note: "Website"}`, then `paid`, `rescheduled`, `cancelled` entries.
- Online payments create a `Payment` with `method: "online"`, `providerRef`, `locationId`, and
  `kind: "booking"` or `kind: "package"`.

## Package purchase (as implemented)

1. Buying a package happens in the same checkout as its **first visit** (matches the admin engine and the site FAQ).
2. `createBooking` creates the `Entitlement` (`sessionsTotal = pkg.sessions`, `expiresAt = now + validityMonths`,
   `paymentStatus: "pending"`) with ledger `purchased` and `reserved`, and a `pending` booking.
3. On payment success: one `kind: "package"` `Payment` for the entitlement price, the entitlement becomes `paid`,
   and the booking becomes `confirmed`.
4. Later sessions are booked with `entitlementId`. They check owner, package, expiry and sessions left, are
   confirmed immediately, and have `price: 0`.
5. Cancel returns the session (`released`). Complete and no-show consume it (`used`), done by staff in the admin.
6. If a purchase is never paid, the hold expires after 10 minutes, the booking is cancelled, and the unpaid entitlement is removed.

## Gaps in the admin contract the customer app had to decide

These need a backend decision. The customer app currently behaves as described.

1. **No standalone package purchase.** The admin creates an entitlement only inside `createBooking`. The customer app
   follows that. A "buy now, book later" flow would need a `POST /entitlements` endpoint.
2. **Pending-hold expiry.** The admin never expires `pending` bookings. The customer app cancels them after 10 minutes
   (`releaseExpiredHolds`). The backend needs a job for this, or an `expired` status.
3. **Specialist lock.** `Entitlement` has no `specialistId`. The UI suggests the previous specialist for later sessions
   but does not lock it.
4. **Cancellation window.** `freeChangeWindowHours` (24) is defined in the admin but never enforced. The customer app
   blocks online cancel and reschedule of confirmed bookings inside 24 hours and points to WhatsApp.
5. **Add-ons.** The admin has no add-on model. The customer app adds SAR 35 per add-on to the price, extends the visit by 20 minutes
   for massage add-ons, and records them in `notes` ("Add-ons: …").
6. **Mixed packages** (Luxury Wellness, no `serviceId`): the booking stores only `packageId`, so which service each
   session used is not recorded.
7. **Extra guests on later sessions.** `extraGuestPrice` is charged at purchase only. Later sessions use `pkg.guests`.
8. **Refunds.** Cancelling a paid single-service booking leaves `paymentStatus: "paid"` so the admin's `refund_review`
   attention flag appears. Package payments are not refunded.
9. **Identity.** The admin has no customer auth. The mock uses phone OTP with `sessionCustomerId`; a real backend needs
   `/me/*` routes scoped to the signed-in customer.
10. **Catalogue ids.** The customer app uses slug ids (`calm-package`). Each item also carries `adminId`
    (`pkg_14`) in `src/app/mock-data.ts` for mapping.
11. **Specialist photos** exist only for Sara and Noura (and an unused Maryam asset). The others fall back to the logo.

## Demo data

The seed (`buildSeed` in `mock-engine.ts`) uses the admin's customers `+966551110001`–`+966551110009`,
specialists, and package states (active with a booked session, nearly expired, all used, expired with sessions left,
not started). Sign in with any of those numbers and any 4–6 digit code. To reset, clear `joud-db` from `localStorage`.
