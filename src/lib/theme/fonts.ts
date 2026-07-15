import { Rubik } from "next/font/google";

export const mainFont = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-main",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
