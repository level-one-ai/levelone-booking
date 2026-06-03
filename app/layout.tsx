import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schedule Your Kickoff Call – Level One",
  description: "Book your kickoff call with Level One. Choose your preferred date and time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
