"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { logout, sweepHolds, useDb } from "./mock-engine";
import { useBranch } from "./site-ui";
import type { Customer } from "./types";

/** The signed-in customer, or null. `ready` is false until the client has read storage. */
export function useAuth(): { customer: Customer | null; ready: boolean; logout: () => void } {
  const { db, ready } = useDb();
  const customer = db.customers.find((item) => item.id === db.sessionCustomerId) ?? null;

  // Also runs when someone signs in, so a due reminder shows up straight away.
  const customerId = customer?.id;
  useEffect(() => {
    sweepHolds();
    const timer = setInterval(sweepHolds, 30_000);
    return () => clearInterval(timer);
  }, [customerId]);

  return { customer, ready, logout };
}

export function authHref(branch: string, next: string) {
  return `/${branch}/auth?next=${encodeURIComponent(next)}`;
}

/** Sends signed-out visitors to the login page and brings them back afterwards. */
export function RequireAuth({
  children,
  fallback,
}: {
  children: (customer: Customer) => ReactNode;
  fallback: ReactNode;
}) {
  const branch = useBranch();
  const pathname = usePathname();
  const router = useRouter();
  const { customer, ready } = useAuth();

  useEffect(() => {
    if (ready && !customer) router.replace(authHref(branch, pathname));
  }, [ready, customer, router, branch, pathname]);

  if (!ready || !customer) return <>{fallback}</>;
  return <>{children(customer)}</>;
}
