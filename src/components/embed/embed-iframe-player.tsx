type EmbedIframePlayerProps = {
  src: string;
  title: string;
};

export function EmbedIframePlayer({ src, title }: EmbedIframePlayerProps) {
  return (
    <iframe
      src={src}
      title={title}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: 0,
      }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
