import type { Metadata } from "next";
import "@/app/globals.css";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Interaction Day"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`antialiased`}>
        <Suspense>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
