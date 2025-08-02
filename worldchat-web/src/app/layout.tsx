import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorldChat",
  description: "Chat with everyone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
