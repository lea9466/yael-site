import Image from "next/image";

type HeroPosterImageProps = {
  url: string;
  alt: string;
  priority?: boolean;
  quality?: number;
  className?: string;
};

export function HeroPosterImage({
  url,
  alt,
  priority = false,
  quality = 85,
  className,
}: HeroPosterImageProps) {
  return (
    <div className="hero-image-wrap">
      <Image
        src={url}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        quality={quality}
        className={className ?? "hero-image"}
      />
    </div>
  );
}
