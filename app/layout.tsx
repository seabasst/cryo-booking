import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Boka Behandling | FSA Workouts HQ",
  description:
    "Boka din behandling online hos FSA Workouts HQ. Kryoterapi, massage, Insculpt och mer.",
  keywords: [
    "FSA Workouts",
    "kryoterapi",
    "massage",
    "insculpt",
    "recovery",
    "träning",
    "boka",
  ],
  openGraph: {
    title: "Boka Behandling | FSA Workouts HQ",
    description:
      "Boka din behandling online hos FSA Workouts HQ.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={inter.variable}>
      <body className="font-sans bg-fsa-black min-h-screen text-fsa-text antialiased">
        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-b from-fsa-black via-fsa-dark to-fsa-black pointer-events-none" />

        {/* Main content */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
