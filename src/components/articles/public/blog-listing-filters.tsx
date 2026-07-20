"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  BLOG_LISTING_SORT_UI,
  countActiveBlogListingFilters,
  parseBlogListingTagSlugs,
  serializeBlogListingTagSlugs,
} from "@/lib/public/blog-listing-ui";
import { buildBlogListingHref } from "@/lib/public/blog-paths";
import type { PublicBlogTag } from "@/lib/public/blog-listing";
import type { PublicBlogListingQuery } from "@/lib/validations/public-blog-listing";
import { cn } from "@/lib/utils/cn";

type DraftFilters = {
  tags: string[];
  sort: PublicBlogListingQuery["sort"];
};

type BlogListingFiltersProps = {
  basePath: string;
  query: PublicBlogListingQuery;
  tags: PublicBlogTag[];
  className?: string;
};

function toDraft(query: PublicBlogListingQuery): DraftFilters {
  return {
    tags: parseBlogListingTagSlugs(query.tag),
    sort: query.sort,
  };
}

export function BlogListingFilters({
  basePath,
  query,
  tags,
  className,
}: BlogListingFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<DraftFilters>(() => toDraft(query));
  const sortGroupId = useId();
  const activeFilterCount = countActiveBlogListingFilters(query);

  const openDrawer = () => {
    setDraft(toDraft(query));
    setDrawerOpen(true);
  };

  const navigate = (next: Partial<PublicBlogListingQuery>) => {
    const href = buildBlogListingHref(basePath, {
      q: next.q ?? query.q,
      tag: next.tag ?? query.tag,
      sort: next.sort ?? query.sort,
      page: next.page ?? 1,
    });

    startTransition(() => {
      router.push(href);
    });
  };

  const toggleTag = (slug: string) => {
    setDraft((current) => {
      const exists = current.tags.includes(slug);

      return {
        ...current,
        tags: exists
          ? current.tags.filter((item) => item !== slug)
          : [...current.tags, slug],
      };
    });
  };

  const applyDraft = () => {
    navigate({
      tag: serializeBlogListingTagSlugs(draft.tags),
      sort: draft.sort,
      page: 1,
    });
    setDrawerOpen(false);
  };

  const clearAndApply = () => {
    setDraft({
      tags: [],
      sort: "newest",
    });
    navigate({
      tag: "all",
      sort: "newest",
      page: 1,
    });
    setDrawerOpen(false);
  };

  return (
    <div className={cn("recipes-listing-filter-trigger", className)}>
      <button
        type="button"
        className={cn(
          "recipes-listing-filter-trigger__button public-focus-ring",
          activeFilterCount > 0 &&
            "recipes-listing-filter-trigger__button--active"
        )}
        onClick={openDrawer}
        aria-haspopup="dialog"
        aria-expanded={drawerOpen}
      >
        <SlidersHorizontal aria-hidden="true" className="size-4" />
        <span>סינון</span>
        {activeFilterCount > 0 ? (
          <span className="recipes-listing-filter-trigger__badge">
            {activeFilterCount}
          </span>
        ) : null}
      </button>

      <Dialog
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="סינון מתקדם"
        description="בחרי תגיות ומיון"
        className="recipes-filter-drawer-overlay"
        panelClassName="recipes-filter-drawer"
        footer={
          <div className="recipes-filter-drawer__actions">
            <Button
              type="button"
              variant="ghost"
              onClick={clearAndApply}
              disabled={isPending}
            >
              נקה סינון
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={applyDraft}
              loading={isPending}
            >
              החל סינון
            </Button>
          </div>
        }
      >
        <div className="recipes-filter-drawer__sections">
          {tags.length > 0 ? (
            <fieldset className="recipes-filter-drawer__section">
              <legend className="recipes-filter-drawer__legend">תגיות</legend>
              <div className="recipes-filter-drawer__chips">
                {tags.map((tag) => {
                  const selected = draft.tags.includes(tag.slug);

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className={cn(
                        "recipes-filter-drawer__chip public-focus-ring",
                        selected && "recipes-filter-drawer__chip--active"
                      )}
                      aria-pressed={selected}
                      onClick={() => toggleTag(tag.slug)}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          <fieldset className="recipes-filter-drawer__section">
            <legend className="recipes-filter-drawer__legend">מיון</legend>
            <div
              className="recipes-filter-drawer__radios"
              role="radiogroup"
              aria-labelledby={sortGroupId}
            >
              <span id={sortGroupId} className="sr-only">
                מיון
              </span>
              {BLOG_LISTING_SORT_UI.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "recipes-filter-drawer__radio",
                    draft.sort === option.value &&
                      "recipes-filter-drawer__radio--active"
                  )}
                >
                  <input
                    type="radio"
                    name="blog-sort"
                    value={option.value}
                    checked={draft.sort === option.value}
                    onChange={() =>
                      setDraft((current) => ({
                        ...current,
                        sort: option.value,
                      }))
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </Dialog>
    </div>
  );
}
