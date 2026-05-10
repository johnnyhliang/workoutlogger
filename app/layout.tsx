import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "./components/BottomNav";
import { RestTimer } from "./components/RestTimer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lift Tracker",
  description: "Personal lift + protein + vert tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lift",
  },
  // icons resolved automatically from app/icon.tsx and app/apple-icon.tsx
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full pb-20">
        <div className="mx-auto max-w-md">{children}</div>
        <RestTimer />
        <BottomNav />
      </body>
    </html>
  );
}
