import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Utsav — Plan the moments that matter",
  description: "A thoughtful, intelligent event planning studio.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
