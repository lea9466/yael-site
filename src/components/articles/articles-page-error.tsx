export function ArticlesPageError() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-error)]/20 bg-[var(--color-error-soft)]/35 px-6 py-10 text-center">
      <p className="text-section-title text-[var(--color-error)]">
        לא ניתן לטעון את רשימת הפוסטים
      </p>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        נסו לרענן את העמוד. אם הבעיה נמשכת, פנו לתמיכה.
      </p>
    </div>
  );
}
