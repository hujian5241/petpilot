export const locales = ["en", "de", "fr", "ja"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"
