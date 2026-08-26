import { useTranslations } from "next-intl";

export default function ContentListLoading() {
  const t = useTranslations("content");

  return (
    <p
      className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-500"
      role="status"
    >
      {t("loading")}
    </p>
  );
}
