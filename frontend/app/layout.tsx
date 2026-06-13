import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import GlobalBackgrounds from "@/components/GlobalBackgrounds";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Vishwakarma — Career Intelligence",
  description: "AI-native career intelligence platform for students and graduates",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vishwakarma",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c6af7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body style={{ paddingBottom: "100px", minHeight: "100vh" }}>
        <Providers>
          <GlobalBackgrounds />
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
