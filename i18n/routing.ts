import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"
import { locales, defaultLocale } from "../lib/locales"

export type Locale = import("../lib/locales").Locale

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
})

export default routing

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
