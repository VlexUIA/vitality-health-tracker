import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Vitality — Health Tracker",
  description: "Track calories, water, vitamins, sleep, and energy",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Vitality" },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <Nav />
        <main className="md:ml-60 pb-20 md:pb-0 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
