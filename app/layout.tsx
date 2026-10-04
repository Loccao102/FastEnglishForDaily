import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FastEnglish — 5 words a day",
  description: "Build an advanced English vocabulary streak with 5 B2–C2 words every day."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
