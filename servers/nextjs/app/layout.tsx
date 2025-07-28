import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fraunces, Montserrat, Inria_Serif, Roboto, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { FooterProvider } from "./(presentation-generator)/context/footerContext";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fraunces",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-montserrat",
});
const inria_serif = Inria_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inria-serif",
});

const inter = localFont({
  src: [
    {
      path: "./fonts/Inter.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-inter",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-roboto",
});

const instrument_sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-sans",
});


export const metadata: Metadata = {
  metadataBase: new URL(),
  title: "Karen Ai",
  description:
    "Karen Ai",
  keywords: [
  ],
  openGraph: {
    title: "Karen Ai",
    description:
      "Karen Ai",
    url: "",
    siteName: "Karen.Ai",
    images: [
      {
        url: "",
        width: 1200,
        height: 630,
        alt: "Karen.Ai Logo",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "",
  },
  twitter: {
    card: "summary_large_image",
    title: "Karen.Ai",
    description:
      "Karen.Ai",
    images: [""],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`$ ${inter.variable} ${fraunces.variable} ${montserrat.variable} ${inria_serif.variable} ${roboto.variable} ${instrument_sans.variable} antialiased`}
      >
        <Providers>
          <FooterProvider>

            {children}
          </FooterProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
