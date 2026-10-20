import { redirect } from "next/navigation";

export default async function Page({ params }: PageProps<"/[branch]/account">) {
  const { branch } = await params;
  redirect(`/${branch}/account/bookings`);
}
