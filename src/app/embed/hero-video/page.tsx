import { EmbedVideoPlayer } from "@/components/embed/embed-video-player";
import { isAllowedHeroVideoSrc } from "@/lib/homepage/hero-video-embed";

type HeroVideoEmbedSearchParams = {
  src?: string;
  type?: string;
  poster?: string;
  title?: string;
  autoplay?: string;
  loop?: string;
  muted?: string;
  controls?: string;
};

export default async function HeroVideoEmbedPage({
  searchParams,
}: {
  searchParams: Promise<HeroVideoEmbedSearchParams>;
}) {
  const params = await searchParams;
  const src = params.src ?? "";

  if (!isAllowedHeroVideoSrc(src)) {
    return null;
  }

  return (
    <EmbedVideoPlayer
      src={src}
      mimeType={params.type || "video/mp4"}
      posterUrl={params.poster || null}
      title={params.title || ""}
      autoplay={params.autoplay !== "0"}
      loop={params.loop !== "0"}
      muted={params.muted !== "0"}
      controls={params.controls === "1"}
    />
  );
}
