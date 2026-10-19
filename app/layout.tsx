import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FastEnglish — Học 5 từ tiếng Anh mỗi ngày",
  description: "Học 5 từ B2–C2 mỗi ngày, ôn tập chủ động, đọc tiếng Anh và theo dõi chuỗi học tập."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
