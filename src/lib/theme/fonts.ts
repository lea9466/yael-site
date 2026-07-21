import { Frank_Ruhl_Libre, Rubik } from "next/font/google";

export const mainFont = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-main",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

/** Hebrew editorial display serif (Playfair-equivalent role for RTL magazine pages). */
export const editorialDisplayFont = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  variable: "--font-editorial-display",
  display: "swap",
  weight: ["400", "500", "700"],
});
