import { CalendarDays, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  formatArticleDateShort,
  formatReadingTimeLabel,
} from "@/lib/articles/format";
import { cn } from "@/lib/utils/cn";

type ArticleMetadataProps = {
  readingTimeMinutes: number;
  publishedAt: string | null;
  updatedAt: string;
  className?: string;
};

type MetaItem = {
  key: "reading" | "date";
  label: string;
  value: string;
  icon: LucideIcon;
};

export function ArticleMetadata({
  readingTimeMinutes,
  publishedAt,
  updatedAt,
  className,
}: ArticleMetadataProps) {
  const items: MetaItem[] = [];

  if (readingTimeMinutes > 0) {
    items.push({
      key: "reading",
      label: "זמן קריאה",
      value: formatReadingTimeLabel(readingTimeMinutes),
      icon: Clock,
    });
  }

  const dateValue = publishedAt ?? updatedAt;
  if (dateValue) {
    items.push({
      key: "date",
      label: publishedAt ? "תאריך פרסום" : "עודכן",
      value: formatArticleDateShort(dateValue),
      icon: CalendarDays,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <dl
      className={cn(
        "recipe-metadata",
        `recipe-metadata--count-${items.length}`,
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.key} className="recipe-metadata__item">
            <dt className="recipe-metadata__header">
              <Icon
                aria-hidden="true"
                className="recipe-metadata__icon"
                strokeWidth={1.75}
              />
              <span className="recipe-metadata__label">{item.label}</span>
            </dt>
            <dd className="recipe-metadata__value">{item.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
