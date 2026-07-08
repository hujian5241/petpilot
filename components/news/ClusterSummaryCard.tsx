import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/routing";
import { Card } from "@/components/ui/Card";
import type { Locale } from "@/lib/i18n";
import type { NewsCluster } from "@/lib/news-types";

interface ClusterSummaryCardProps {
  cluster: NewsCluster;
  locale: Locale;
  heading: string;
  description: string;
  linkText: string;
}

export function ClusterSummaryCard({
  cluster,
  locale,
  heading,
  description,
  linkText,
}: ClusterSummaryCardProps) {
  return (
    <Card className="mt-6 border-primary/20 bg-primary-subdued/30 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h2 className="text-sm font-medium text-foreground">{heading}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <p className="mt-2 text-sm text-foreground">
            {cluster.summary.length > 160
              ? `${cluster.summary.slice(0, 157).trim()}...`
              : cluster.summary}
          </p>
        </div>
        <Link
          href={`/news/${cluster.canonicalSlug}`}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-primary bg-transparent px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-subdued"
        >
          {linkText}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
