import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FastEnglish — Reading & Vocabulary Studio",
  description: "Học 5 từ B2–C2 mỗi ngày, đọc tiếng Anh nâng cao, highlight, lưu từ và ghi chú theo ngữ cảnh."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Literata:wght@400;500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
