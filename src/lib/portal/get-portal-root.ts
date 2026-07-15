export function getPortalRoot(): HTMLElement {
  if (typeof document === "undefined") {
    throw new Error("Portal root is only available in the browser.");
  }

  return document.getElementById("portal-root") ?? document.body;
}
