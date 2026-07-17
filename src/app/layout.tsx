import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "AI Email Summarizer",
  description: "Turn long emails into clear summaries and action items.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
