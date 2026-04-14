import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SessionAuthProvider from "@/components/providers/SessionAuthProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rentro",
  description: "Rentro campus marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <SessionAuthProvider>{children}</SessionAuthProvider>
      </body>
    </html>
  );
}
