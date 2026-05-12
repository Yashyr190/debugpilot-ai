import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "DebugPilot AI",
  description: "A lightweight AI-powered debugging assistant for developers."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
