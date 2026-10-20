import { BookingFlow } from "../../../booking-flow";
import { productCatalogue } from "../../../product-catalogue";
import { branches } from "../../../site-data";

export function generateStaticParams() {
  return branches.flatMap((branch) => productCatalogue.map((p) => ({ branch, product: p.id })));
}

export default function Page() {
  return <BookingFlow />;
}
