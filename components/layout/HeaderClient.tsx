"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import { usePathname, Link } from "@/i18n/routing";
import { locales, type Locale } from "@/lib/i18n";

interface LocaleSwitcherProps {
  locale: Locale;
}

const localeLabels: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  ja: "日本語",
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  onEscape: () => void
) {
  const previouslyFocused = useRef<Element | null>(null);

  useEffect(() => {
    if (!enabled) return undefined;

    previouslyFocused.current = document.activeElement;
    const container = containerRef.current;
    const focusable = container?.querySelectorAll(FOCUSABLE_SELECTOR);
    const first = focusable?.[0] as HTMLElement | undefined;
    first?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== "Tab" || !container) return;

      const elements = Array.from(
        container.querySelectorAll(FOCUSABLE_SELECTOR)
      ) as HTMLElement[];
      if (elements.length === 0) return;

      const firstEl = elements[0]!;
      const lastEl = elements[elements.length - 1]!;

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (
        previouslyFocused.current instanceof HTMLElement &&
        document.body.contains(previouslyFocused.current)
      ) {
        previouslyFocused.current.focus();
      }
    };
  }, [containerRef, enabled, onEscape]);
}

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;

    function handlePointer(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [ref, onClose, enabled]);
}

export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const mounted = useMounted();

  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md p-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="uppercase">{locale}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-lg border border-border bg-background py-1 shadow-panel"
        >
          {locales.map((l) => (
            <li key={l} role="option" aria-selected={l === locale}>
              {l === locale ? (
                <span className="block bg-muted px-4 py-2 text-sm font-medium text-foreground">
                  {localeLabels[l]}
                </span>
              ) : (
                <Link
                  href={pathname}
                  locale={l}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {localeLabels[l]}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface NavDropdownProps {
  label: string;
  items: { href: string; label: string }[];
  active?: boolean;
}

export function NavDropdown({ label, items, active }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const mounted = useMounted();

  useClickOutside(ref, () => setOpen(false), open);

  function isActive(href: string): boolean {
    if (!mounted) return false;
    return href === pathname;
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
          active
            ? "font-semibold text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute left-0 top-full z-50 w-48 rounded-lg border border-border bg-background py-1 shadow-panel"
        >
          {items.map((item) => (
            <li key={item.href} role="none">
              <Link
                href={item.href}
                role="menuitem"
                className="block px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-current={isActive(item.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface MobileMenuProps {
  locale: Locale;
  navItems: { href: string; label: string; variant?: "default" | "emergency" }[];
  categoryItems: { href: string; label: string }[];
}

export function MobileMenu({ locale, navItems, categoryItems }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const t = useTranslations("Header");
  const mounted = useMounted();

  useClickOutside(ref, () => setOpen(false), open);
  useFocusTrap(menuRef, open, () => setOpen(false));

  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
    return undefined;
  }, [open]);

  function isActive(href: string): boolean {
    if (!mounted) return false;
    return href === pathname;
  }

  return (
    <div ref={ref} className="flex items-center md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-md p-2 text-muted-foreground hover:bg-muted"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("openMenu")}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div
          ref={menuRef}
          className="fixed inset-0 top-16 z-40 bg-background px-4 py-6 shadow-panel"
        >
          <nav aria-label="Mobile" className="space-y-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2.5 text-base font-medium ${
                    item.variant === "emergency"
                      ? `${isActive(item.href) ? "font-semibold underline underline-offset-4" : ""} text-emergency hover:bg-emergency-light`
                      : `${isActive(item.href) ? "font-semibold text-foreground" : "text-foreground"} hover:bg-muted`
                  }`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">
                {t("categories")}
              </p>
              <div className="mt-2 space-y-1">
                {categoryItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-md px-3 py-2 text-sm ${
                      isActive(item.href)
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    } hover:bg-muted hover:text-foreground`}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">
                {t("language")}
              </p>
              <div className="mt-2 flex gap-2 px-3">
                {locales.map((l) => (
                  <Link
                    key={l}
                    href={pathname}
                    locale={l}
                    onClick={() => setOpen(false)}
                    className={`rounded-md px-3 py-1.5 text-sm ${
                      l === locale
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {localeLabels[l]}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
