import type { Metadata } from "next";
import "./globals.css";
import ConditionalNav from "../components/ConditionalNav"; // Import the new gatekeeper

export const metadata: Metadata = {
  title: "Stampede",
  description: "Style the show. Join the herd.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        {/* This now checks the URL before showing the Nav */}
        <ConditionalNav />

        <main>
          {children}
        </main>
      </body>
    </html>
  );
}