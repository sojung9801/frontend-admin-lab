"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useContents } from "@/features/content/hooks/useContents";
import ContentListLoading from "@/features/content/ui/ContentListLoading";
import type {
  ContentFilters,
  ContentStatus,
} from "@/features/content/model/content";
import {
  areContentFiltersEqual,
  createContentUrl,
  hasInvalidPage,
  parseContentFilters,
  removeInvalidPage,
} from "@/features/content/model/contentQuery";

type StatusFilter = ContentFilters["status"];

const paginationButtonClassName =
  "rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40";

const statusBadgeClassName: Record<ContentStatus, string> = {
  published:
    "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700",
  draft:
    "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700",
};

export default function ContentList() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseContentFilters(searchParams);
  const { search, status } = filters;
  const { data, error, isFetching, isPending, refetch } = useContents(filters);
  const t = useTranslations("content");
  const hasFilters = search.length > 0 || status !== "all";

  useEffect(() => {
    if (!hasInvalidPage(searchParams)) {
      return;
    }

    const correctedUrl = removeInvalidPage(pathname, searchParams);
    router.replace(correctedUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  function updateFilters(nextFilters: ContentFilters) {
    const normalizedFilters = {
      ...nextFilters,
      search: nextFilters.search.trim(),
    };

    if (areContentFiltersEqual(filters, normalizedFilters)) {
      return;
    }

    router.push(createContentUrl(pathname, normalizedFilters), {
      scroll: false,
    });
  }

  function changeSearch(nextSearch: string) {
    updateFilters({ ...filters, search: nextSearch, page: 1 });
  }

  function changeStatus(nextStatus: StatusFilter) {
    updateFilters({ ...filters, status: nextStatus, page: 1 });
  }

  return (
    <section aria-busy={isFetching}>
      <div
        className="mb-6 grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_220px]"
        role="search"
      >
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">
          {t("filters.searchLabel")}
          <input
            className="rounded-lg border border-zinc-300 px-3 py-2.5 font-normal text-zinc-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            onChange={(event) => changeSearch(event.target.value)}
            placeholder={t("filters.searchPlaceholder")}
            type="search"
            value={search}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-zinc-700">
          {t("filters.statusLabel")}
          <select
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-normal text-zinc-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            onChange={(event) =>
              changeStatus(event.target.value as StatusFilter)
            }
            value={status}
          >
            <option value="all">{t("filters.all")}</option>
            <option value="published">{t("status.published")}</option>
            <option value="draft">{t("status.draft")}</option>
          </select>
        </label>
      </div>

      {isFetching && !isPending ? (
        <p className="mb-3 text-sm text-zinc-500" role="status">
          {t("updating")}
        </p>
      ) : null}

      {isPending ? (
        <ContentListLoading />
      ) : error ? (
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
      ) : data.items.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-500">
          {t(hasFilters ? "noResults" : "empty")}
        </p>
      ) : (
        <>
          <ul className="grid gap-4 md:grid-cols-2">
            {data.items.map((content) => (
              <li
                key={content.id}
                className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {t("itemLabel", { id: content.id })}
                  </p>
                  <span className={statusBadgeClassName[content.status]}>
                    {t(`status.${content.status}`)}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-zinc-950">
                  {content.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
                  {content.body}
                </p>
              </li>
            ))}
          </ul>

          <nav
            aria-label={t("pagination.label")}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <button
              className={paginationButtonClassName}
              disabled={!data.pagination.hasPreviousPage || isFetching}
              onClick={() =>
                updateFilters({ ...filters, page: filters.page - 1 })
              }
              type="button"
            >
              {t("pagination.previous")}
            </button>
            <p className="min-w-28 text-center text-sm font-medium text-zinc-600">
              {t("pagination.current", {
                page: data.pagination.page,
                totalPages: data.pagination.totalPages,
              })}
            </p>
            <button
              className={paginationButtonClassName}
              disabled={!data.pagination.hasNextPage || isFetching}
              onClick={() =>
                updateFilters({ ...filters, page: filters.page + 1 })
              }
              type="button"
            >
              {t("pagination.next")}
            </button>
          </nav>
        </>
      )}
    </section>
  );
}
