import { branches } from "../../../site-data";
import { productCatalogue } from "../../../product-catalogue";
import { BookingView } from "../../../views";

export function generateStaticParams() {
  return branches.flatMap((branch) => productCatalogue.map((p) => ({ branch, product: p.id })));
}

export default function Page() {
  return <BookingView />;
}
