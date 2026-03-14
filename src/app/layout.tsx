import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import { AppHeader } from "@/components/layout/app-header";
import { Providers } from "@/components/providers";
import { ActionFeedback } from "@/components/ui/action-feedback";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineDEViana",
  description: "Descubra, organize e acompanhe filmes e séries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <Providers>
          <AppHeader />
          {children}
          <ActionFeedback />
        </Providers>
      </body>
    </html>
  );
}
