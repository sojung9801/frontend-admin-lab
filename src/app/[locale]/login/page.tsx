import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import LoginForm from "@/features/auth/ui/LoginForm";
import { getCurrentUser } from "@/features/auth/server/session";

import LanguageSwitcher from "../LanguageSwitcher";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({
  params,
}: LoginPageProps) {
  const { locale } = await params;
  const [user, t] = await Promise.all([
    getCurrentUser(),
    getTranslations({ locale, namespace: "auth" }),
  ]);

  if (user) {
    redirect(`/${locale}/admin`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-6 py-12 font-sans">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/60 sm:p-10">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-widest text-blue-600">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          {t("description")}
        </p>

        <LoginForm />

        <div className="mt-6 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
          <p className="font-semibold text-zinc-800">{t("demo.title")}</p>
          <p>{t("demo.admin")}</p>
          <p>{t("demo.viewer")}</p>
        </div>
      </section>
    </main>
  );
}
