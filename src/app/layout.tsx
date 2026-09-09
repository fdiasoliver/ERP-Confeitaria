import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/components/Providers";
import { PwaServiceWorker } from "@/components/PwaServiceWorker";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Fonte única (Sprint DS.3) — substitui Fraunces (display) + DM Sans (corpo).
// Mesma variável usada nos dois slots de --theme inline (--font-display/--font-sans).
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doce Atelier — Confeitaria Artesanal",
  description: "Encomendas de bolos, doces e docinhos artesanais em São Paulo",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Doce Menina",
  },
};

export const viewport: Viewport = {
  themeColor: "#191715",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} h-full`}>
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
        <Toaster position="bottom-center" richColors />
        <PwaServiceWorker />
      </body>
    </html>
  );
}
