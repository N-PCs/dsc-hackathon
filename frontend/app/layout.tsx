import type { Metadata } from "next";
import { Bebas_Neue, Oswald, Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/lib/authContext";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-heading",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-subheading",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ORIGIN '26 — 24-Hour Overnight Hackathon | Data Science Club",
  description:
    "ORIGIN is the flagship 24-hour overnight hackathon by the Data Science Club at VIT Bhopal. Register your team, build something extraordinary, win ₹1,50,000+ in prizes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html
        lang="en"
        className={`${bebasNeue.variable} ${oswald.variable} ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full`}
      >
        <body className="min-h-full flex flex-col bg-black text-white antialiased">
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </AuthProvider>
  );
}