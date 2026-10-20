import { redirect } from "next/navigation";

export default async function Page({ params }: PageProps<"/[branch]/booking">) {
  const { branch } = await params;
  redirect(`/${branch}/services`);
}
