"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("language");
  const [isPending, startTransition] = useTransition();

  function changeLocale(nextLocale: Locale) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm font-medium text-zinc-600">
      <span>{t("label")}</span>
      <select
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 disabled:opacity-60"
        disabled={isPending}
        onChange={(event) => changeLocale(event.target.value as Locale)}
        value={locale}
      >
        {routing.locales.map((availableLocale) => (
          <option key={availableLocale} value={availableLocale}>
            {t(availableLocale)}
          </option>
        ))}
      </select>
    </label>
  );
}
