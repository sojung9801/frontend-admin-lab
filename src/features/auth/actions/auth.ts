"use server";

import { redirect } from "next/navigation";

import { isLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";

import { createSession, deleteSession } from "../server/session";
import { authenticateUser } from "../server/users";

export type LoginState = {
  error?: "invalidCredentials" | "required";
};

function getLocale(formData: FormData) {
  const locale = formData.get("locale");

  return isLocale(locale) ? locale : routing.defaultLocale;
}

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "required" };
  }

  if (!email.trim() || !password) {
    return { error: "required" };
  }

  const user = authenticateUser(email, password);

  if (!user) {
    return { error: "invalidCredentials" };
  }

  const locale = getLocale(formData);
  await createSession(user.id);
  redirect(`/${locale}/admin`);
}

export async function logout(formData: FormData) {
  const locale = getLocale(formData);

  await deleteSession();
  redirect(`/${locale}/login`);
}
