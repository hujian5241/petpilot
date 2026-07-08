import Image from "next/image";

import { Link } from "@/i18n/routing";
import type { Locale } from "@/lib/i18n";
import type { GuideEntry } from "@/lib/types";

interface GuideCardProps {
  guide: GuideEntry;
  locale: Locale;
}

export function GuideCard({ guide, locale }: GuideCardProps) {
  const publishedAt = guide.published_at
    ? new Date(guide.published_at).toLocaleDateString(locale)
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-card">
      <Link href={`/guides/${guide.slug}`} className="block overflow-hidden">
        <div className="relative aspect-[16/9] w-full bg-muted">
          <Image
            src={guide.image?.src ?? `/images/guides/${guide.slug}.svg`}
            alt={guide.image?.alt ?? guide.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs font-medium uppercase tracking-wide text-primary">
          {guide.category}
        </div>
        <Link href={`/guides/${guide.slug}`}>
          <h3 className="mt-2 text-lg font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
            {guide.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {guide.description}
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          {guide.read_time_minutes != null && (
            <span>{guide.read_time_minutes} min read</span>
          )}
          {guide.read_time_minutes != null && publishedAt && <span>·</span>}
          {publishedAt && <span>{publishedAt}</span>}
        </div>
      </div>
    </article>
  );
}
