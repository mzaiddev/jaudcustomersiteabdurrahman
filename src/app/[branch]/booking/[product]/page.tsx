import { redirect } from "next/navigation";
import { productCatalogue } from "../../../product-catalogue";
import { branches } from "../../../site-data";

export function generateStaticParams() {
  return branches.flatMap((branch) => productCatalogue.map((p) => ({ branch, product: p.id })));
}

export default async function Page({ params }: PageProps<"/[branch]/booking/[product]">) {
  const { branch, product } = await params;
  redirect(`/${branch}/book/${product}`);
}
