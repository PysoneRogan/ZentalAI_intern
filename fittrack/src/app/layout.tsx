import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FitTrack",
  description: "Track your fitness journey and achieve your goals",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900">
        <div className="container-max py-8">
          {children}
        </div>
      </body>
    </html>
  );
}