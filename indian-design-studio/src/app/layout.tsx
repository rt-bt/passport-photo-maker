import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Indian Design Studio - All-in-One Graphic Design SaaS Platform",
  description: "Create Indian Wedding Invitations, ID Cards, Festival Posters, Business Cards, AI Graphics, and Passport Photos in minutes.",
  keywords: [
    "Indian Design Studio",
    "Wedding Invitation Maker",
    "Indian ID Card Generator",
    "Festival Poster Maker",
    "Canva Alternative India",
    "Hindi Design Tool",
    "Passport Photo Maker"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
