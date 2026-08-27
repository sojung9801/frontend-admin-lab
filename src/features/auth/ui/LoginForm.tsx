"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";

import { login, type LoginState } from "../actions/auth";

const initialState: LoginState = {};

export default function LoginForm() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 grid gap-5">
      <input name="locale" type="hidden" value={locale} />

      <label className="grid gap-2 text-sm font-semibold text-zinc-700">
        {t("email")}
        <input
          autoComplete="email"
          autoFocus
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 font-normal text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          name="email"
          placeholder="admin@example.com"
          required
          type="email"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-zinc-700">
        {t("password")}
        <input
          autoComplete="current-password"
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 font-normal text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          minLength={8}
          name="password"
          placeholder="••••••••"
          required
          type="password"
        />
      </label>

      {state.error ? (
        <p
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {t(`errors.${state.error}`)}
        </p>
      ) : null}

      <button
        className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {t(isPending ? "submitting" : "submit")}
      </button>
    </form>
  );
}
