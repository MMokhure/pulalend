import type { Metadata } from "next";
import "./globals.css";
import ChatbotWidget from "@/components/ChatbotWidget";

export const metadata: Metadata = {
  title: "Pulalend - The Smart Lender",
  description: "Connect borrowers with lenders. Simple, trustworthy, and accessible.",
  icons: {
    icon: '/logo3.jpeg',
    shortcut: '/logo3.jpeg',
    apple: '/logo3.jpeg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
