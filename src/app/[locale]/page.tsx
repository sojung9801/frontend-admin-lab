import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/server/session";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  const user = await getCurrentUser();

  redirect(`/${locale}/${user ? "admin" : "login"}`);
}
