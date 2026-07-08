"use client";

import { NextIntlClientProvider as BaseProvider } from "next-intl";

export function NextIntlClientProvider({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}) {
  return (
    <BaseProvider locale={locale} messages={messages} timeZone="UTC">
      {children}
    </BaseProvider>
  );
}
