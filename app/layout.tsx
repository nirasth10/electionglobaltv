import type { Metadata } from "next";
import { Geist, Geist_Mono, Mukta } from "next/font/google";
import { AuthProvider } from "@/app/context/AuthContext";
import { SocketProvider } from "@/app/context/SocketContext";
import { ElectionProvider } from "@/app/context/ElectionContext";
import { TickerProvider } from "@/app/context/TickerContext";
import { NewsProvider } from "@/app/context/NewsContext";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Global TV Khabar – Nepal Election 2026",
  description: "Real-time live Nepal election results and updates",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ne">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Mukta:wght@200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${mukta.variable} antialiased bg-transparent min-h-screen`}
      >
        <AuthProvider>
          <SocketProvider>
            <ElectionProvider>
              <TickerProvider>
                <NewsProvider>
                  {children}
                </NewsProvider>
              </TickerProvider>
            </ElectionProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
