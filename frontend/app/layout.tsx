import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bebas_Neue, Oswald, Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        variables: {
          colorPrimary: "#FF3B00",
          colorBackground: "#0D0D0D",
          colorInput: "#171717",
          colorDanger: "#EF4444",
          borderRadius: "0.375rem",
          fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        },
        elements: {
          modalContent: "bg-[#0D0D0D] border border-[#262626] shadow-2xl rounded-lg text-white",
          modalBackdrop: "backdrop-blur-sm bg-black/80",
          card: "bg-[#0D0D0D] border border-[#262626] shadow-2xl rounded-lg text-white",
          headerTitle: "text-white font-bold uppercase tracking-wider text-lg",
          headerSubtitle: "text-neutral-300 text-xs",
          socialButtonsBlockButton: {
            backgroundColor: "#171717",
            borderColor: "#262626",
            color: "#FFFFFF !important",
            "&:hover": {
              backgroundColor: "#262626",
              borderColor: "#FF3B00",
            },
          },
          socialButtonsBlockButtonText: {
            color: "#FFFFFF !important",
            fontWeight: 600,
            fontSize: "14px",
          },
          socialButtonsIconButton: {
            color: "#FFFFFF !important",
          },
          dividerLine: "bg-[#262626]",
          dividerText:
            "text-neutral-400 uppercase text-xs tracking-widest font-semibold",
          formFieldLabel:
            "text-neutral-200 uppercase text-xs tracking-wider font-semibold",
          formFieldInput:
            "bg-[#171717] border border-[#262626] text-white focus:border-[#FF3B00] focus:ring-1 focus:ring-[#FF3B00] rounded transition-all",
          formButtonPrimary:
            "bg-[#FF3B00] hover:bg-[#FF5511] text-white font-bold uppercase tracking-wider py-2.5 shadow-md shadow-[#FF3B00]/20 transition-all cursor-pointer border-none",
          footerActionLink:
            "text-[#FF3B00] hover:text-[#FF5511] font-semibold transition-colors",
          footerActionText: "text-neutral-300",
          identityPreview: "bg-[#171717] border border-[#262626]",
          identityPreviewText: "text-white",
          identityPreviewEditButton:
            "text-[#FF3B00] hover:text-[#FF5511]",
          userButtonPopoverCard:
            "bg-[#0D0D0D] border border-[#262626] text-white shadow-2xl",
          userButtonPopoverActionButton:
            "text-white hover:bg-[#171717] hover:text-[#FF3B00] transition-colors",
          userButtonPopoverActionButtonText: "text-neutral-200",
          userButtonPopoverFooter: "hidden",
        },
      }}
    >
      <html
        lang="en"
        className={`${bebasNeue.variable} ${oswald.variable} ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full`}
      >
        <body className="min-h-full flex flex-col bg-black text-white antialiased">
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}