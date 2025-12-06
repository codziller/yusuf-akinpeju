import "styles/globals.css";
import { useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/router";
import { Space_Mono } from "@next/font/google";
import localFont from "@next/font/local";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export const avanir = localFont({
  src: [
    {
      path: "../../public/fonts/Avenir-Light.woff2",
      weight: "400",
    },
    {
      path: "../../public/fonts/Avenir-Book.woff2",
      weight: "500",
    },
    {
      path: "../../public/fonts/Avenir-Medium.woff2",
      weight: "600",
    },
    {
      path: "../../public/fonts/Avenir-Heavy.woff2",
      weight: "700",
    },
    {
      path: "../../public/fonts/Avenir-Black.woff2",
      weight: "800",
    },
  ],
  variable: "--font-avanir",
  preload: true,
  display: "swap",
});

const futora = localFont({
  src: [
    {
      path: "../../public/fonts/FuturaPT-Bold.woff2",
      weight: "700",
    },
  ],
  variable: "--font-futora",
  preload: true,
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <div id="app-modal-root"></div>
      <main
        className={`${spaceMono.variable} font-mono`}
        style={{ fontFamily: 'var(--font-space-mono), monospace' }}
      >
        <Component {...pageProps} />
      </main>
    </>
  );
}
