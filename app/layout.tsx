import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FROM — Official Series Hub",
  description:
    "Watch every episode of FROM — the critically acclaimed sci-fi horror series on MGM+.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-void text-chalk antialiased">{children}</body>
    </html>
  );
}
