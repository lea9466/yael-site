import { Suspense } from "react";

import { MediaLibraryClient } from "@/components/media/media-library-client";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";
import { MediaPageError } from "@/components/media/media-page-error";
import { fetchMediaLibrary } from "@/lib/media/queries";
import { requireAdmin } from "@/lib/auth/session";
import { listMediaQuerySchema } from "@/lib/validations/media";

export const dynamic = "force-dynamic";

type MediaPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function MediaPage({ searchParams }: MediaPageProps) {
  await requireAdmin();

  const rawParams = await searchParams;
  const parsedQuery = listMediaQuerySchema.safeParse(rawParams);
  const query = parsedQuery.success
    ? parsedQuery.data
    : listMediaQuerySchema.parse({});

  const data = await fetchMediaLibrary(query);

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <MediaPageError />
      </div>
    );
  }

  return (
    <Suspense fallback={<MediaGridSkeleton />}>
      <MediaLibraryClient
        key={`${data.query.q}-${data.query.sort}-${data.query.page}`}
        data={data}
      />
    </Suspense>
  );
}
