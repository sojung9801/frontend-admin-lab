import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { logout } from "@/features/auth/actions/auth";
import { getCurrentUser } from "@/features/auth/server/session";

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <div>
            <p className="font-semibold text-zinc-950">{user.name}</p>
            <p className="text-sm text-zinc-500">
              {user.email} · {t(`roles.${user.role}`)}
            </p>
          </div>

          <form action={logout}>
            <input name="locale" type="hidden" value={locale} />
            <button
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
              type="submit"
            >
              {t("logout")}
            </button>
          </form>
        </div>
      </header>

      {children}
    </div>
  );
}
