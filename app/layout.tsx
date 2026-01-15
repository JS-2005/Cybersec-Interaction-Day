import type { Metadata } from "next";
import "@/app/globals.css";
import CybersecNav from "@/components/navigation-bar";

export const metadata: Metadata = {
  title: "Interaction Day"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`antialiased`}>
        <CybersecNav>
          {children}
        </CybersecNav>
      </body>
    </html>
  );
}
