import { redirect } from "next/navigation";

export default async function Page({ params }: PageProps<"/[branch]/book">) {
  const { branch } = await params;
  redirect(`/${branch}/services`);
}
