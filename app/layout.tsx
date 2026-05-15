import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "../lib/auth-context";

export const metadata: Metadata = {
  title: "Site Tracker MVP",
  description: "Track website fields, prices, and page metadata with a launch-tier dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
