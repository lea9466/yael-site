import { EmbedIframePlayer } from "@/components/embed/embed-iframe-player";
import { EmbedVideoPlayer } from "@/components/embed/embed-video-player";
import {
  getYouTubeOrVimeoEmbedUrl,
  isAllowedHeroVideoSrc,
} from "@/lib/homepage/hero-video-embed";

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

  const title = params.title || "";
  const providerEmbedUrl = getYouTubeOrVimeoEmbedUrl(src);

  if (providerEmbedUrl) {
    return <EmbedIframePlayer src={providerEmbedUrl} title={title} />;
  }

  return (
    <EmbedVideoPlayer
      src={src}
      mimeType={params.type || "video/mp4"}
      posterUrl={params.poster || null}
      title={title}
      autoplay={params.autoplay !== "0"}
      loop={params.loop !== "0"}
      muted={params.muted !== "0"}
      controls={params.controls === "1"}
    />
  );
}
