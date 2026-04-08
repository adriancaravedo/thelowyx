import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/store/AppContext";
import { AuthProvider } from "@/store/AuthContext";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const metadata: Metadata = {
  title: "TheLowyx",
  description: "Your personal finance OS",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50">
        <AuthProvider>
          <AppProvider>
            <div className="max-w-[430px] mx-auto min-h-screen">
              {children}
            </div>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
