import { Suspense, type ReactNode } from "react";
import { SiteShell } from "../site-ui";
import { branches } from "../site-data";

export function generateStaticParams() {
  return branches.map((branch) => ({ branch }));
}

export default function BranchLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <SiteShell>{children}</SiteShell>
    </Suspense>
  );
}
