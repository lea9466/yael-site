import "./press-paper.css";

type PressNewspaperMarkProps = {
  publicationName: string;
  className?: string;
  compact?: boolean;
};

/** Decorative newspaper mark — used instead of cover photos on press cards. */
export function PressNewspaperMark({
  publicationName,
  className,
  compact = false,
}: PressNewspaperMarkProps) {
  return (
    <div
      className={className}
      aria-hidden="true"
      data-compact={compact ? "true" : undefined}
    >
      <div className="press-paper">
        <div className="press-paper__sheet press-paper__sheet--back" />
        <div className="press-paper__sheet press-paper__sheet--front">
          <div className="press-paper__masthead">
            <span className="press-paper__brand">
              {publicationName || "עיתון"}
            </span>
            <span className="press-paper__rule" />
          </div>

          <div className="press-paper__columns">
            <div className="press-paper__col">
              <span className="press-paper__line press-paper__line--wide" />
              <span className="press-paper__line" />
              <span className="press-paper__line" />
              <span className="press-paper__line press-paper__line--short" />
              <span className="press-paper__block" />
              <span className="press-paper__line" />
              <span className="press-paper__line press-paper__line--mid" />
            </div>
            <div className="press-paper__col">
              <span className="press-paper__line" />
              <span className="press-paper__line press-paper__line--mid" />
              <span className="press-paper__line" />
              <span className="press-paper__line press-paper__line--short" />
              <span className="press-paper__line" />
              <span className="press-paper__line press-paper__line--wide" />
              <span className="press-paper__line press-paper__line--mid" />
            </div>
          </div>

          <div className="press-paper__fold" />
        </div>
      </div>
    </div>
  );
}
