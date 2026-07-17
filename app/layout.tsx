import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Textify — Same facts. Better fit.",
  description:
    "Transform one summary into Gen Z, simple, and cheat-sheet versions without changing the facts.",
  openGraph: {
    title: "Textify — Same facts. Better fit.",
    description:
      "Transform one summary into three audience-ready versions.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Textify" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Textify — Same facts. Better fit.",
    description:
      "Transform one summary into three audience-ready versions.",
    images: ["/og.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
