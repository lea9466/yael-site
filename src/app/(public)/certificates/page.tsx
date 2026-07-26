import { permanentRedirect } from "next/navigation";

/** Legacy URL — certificates now live at the end of the about page. */
export default function PublicCertificatesPage() {
  permanentRedirect("/about#certificates");
}
