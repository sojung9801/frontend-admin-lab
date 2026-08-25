"use client";

import { useContents } from "@/features/content/hooks/useContents";
import { useTranslations } from "next-intl";

export default function ContentList() {
  const { data: contents, error, isPending, refetch } = useContents();
  const t = useTranslations("content");

  if (isPending) {
    return (
      <p className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-500">
        {t("loading")}
      </p>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
        role="alert"
      >
        <p>{t("error")}</p>
        <button
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          onClick={() => refetch()}
          type="button"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  if (!contents.length) {
    return (
      <p className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-500">
        {t("empty")}
      </p>
    );
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {contents.map((content) => (
        <li
          key={content.id}
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("itemLabel", { id: content.id })}
          </p>
          <h2 className="text-lg font-semibold text-zinc-950">
            {content.title}
          </h2>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
            {content.body}
          </p>
        </li>
      ))}
    </ul>
  );
}
