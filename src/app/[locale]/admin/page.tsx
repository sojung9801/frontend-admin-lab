import { useTranslations } from "next-intl";
import { Suspense } from "react";

import ContentList from "@/features/content/ui/ContentList";
import ContentListLoading from "@/features/content/ui/ContentListLoading";

import LanguageSwitcher from "../LanguageSwitcher";

export default function AdminPage() {
  const t = useTranslations("page");

  return (
    <main className="px-6 py-12 font-sans sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                {t("eyebrow")}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
                {t("title")}
              </h1>
              <p className="mt-2 text-zinc-600">{t("description")}</p>
            </div>

            <Suspense fallback={null}>
              <LanguageSwitcher />
            </Suspense>
          </div>
        </header>

        <Suspense fallback={<ContentListLoading />}>
          <ContentList />
        </Suspense>
      </div>
    </main>
  );
}
