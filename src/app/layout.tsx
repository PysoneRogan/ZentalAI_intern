import "./globals.css";
import type { Metadata } from "next";
import { UserProvider } from '@/components/providers/UserProvider'
import { ToastProvider } from '@/components/ui/Toast'
import SuccessBanner from '@/components/SuccessBanner'

export const metadata: Metadata = {
  title: "FitTrack",
  description: "Track your fitness journey and achieve your goals",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900">
        <UserProvider>
          {children}
          <SuccessBanner />
          <ToastProvider />
        </UserProvider>
      </body>
    </html>
  );
}