export function focusRepeaterItemFirstField(container: HTMLElement): void {
  const editable = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    'input:not([type="hidden"]):not([disabled]), textarea:not([disabled])'
  );

  if (!editable) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.requestAnimationFrame(() => {
    editable.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
    });
    editable.focus({ preventScroll: true });

    const length = editable.value.length;

    if (typeof editable.setSelectionRange === "function") {
      editable.setSelectionRange(length, length);
    }
  });
}
