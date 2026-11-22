import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import Nav from "@/components/Nav";
import Cursor from "@/components/Cursor";
import Motion from "@/components/Motion";
import PlayerProvider from "@/components/PlayerProvider";
import ScrollHint from "@/components/ScrollHint";

const disp = Archivo({ subsets: ["latin"], axes: ["wdth"], display: "swap", variable: "--f-disp" });
const body = Inter({ subsets: ["latin"], display: "swap", variable: "--f-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: "400", display: "swap", variable: "--f-mono" });

export const metadata: Metadata = { title: "Yousef Alkady", description: "Builds and runs live software." };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0A0A0B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${disp.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <LenisProvider>
          <PlayerProvider>
            <Nav />
            {children}
            <Cursor />
            <Motion />
            <ScrollHint />
          </PlayerProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
