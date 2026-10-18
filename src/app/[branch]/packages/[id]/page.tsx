import { branches } from "../../../site-data";
import { productCatalogue } from "../../../product-catalogue";
import { DetailView } from "../../../views";

export function generateStaticParams() {
  return branches.flatMap((branch) =>
    productCatalogue.filter((p) => p.kind === "package").map((p) => ({ branch, id: p.id })),
  );
}

export default function Page() {
  return <DetailView kind="package" />;
}
