import type { Metadata } from "next";
import { ThemeProvider } from "@/app/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "VB Admin Panel",
  description: "Admin Panel for VB administration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
