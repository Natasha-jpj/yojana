// src/app/layout.tsx
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="m-0 p-0">
        <div className="fixed top-6 left-0 z-[9999]">
          <Link href="/?start=1" aria-label="Start plan" className="block">
            <Image
              src="/LOGO-removebg-preview.png"
              alt="Yojana logo"
              width={200}
              height={200}
              priority
              className="block w-auto object-contain object-left-top"
              style={{ height: "10rem", width: "10rem" }}
            />
          </Link>
        </div>

        {/* 👇 This boundary satisfies Next’s requirement for useSearchParams */}
        <Suspense fallback={<div />}>{children}</Suspense>
      </body>
    </html>
  );
}
