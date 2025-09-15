// src/app/layout.tsx
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="m-0 p-0">
        {/* Fixed logo, responsive sizes, respects safe areas */}
        <div
          className="fixed left-2 top-2 md:left-4 md:top-4 z-[9999]"
          style={{
            left: "max(0.5rem, env(safe-area-inset-left))",
            top: "max(0.5rem, env(safe-area-inset-top))",
          }}
        >
          <Link href="/?start=1" aria-label="Start plan" className="block">
            <Image
              src="/LOGO-removebg-preview.png"
              alt="Yojana logo"
              width={200}
              height={200}
              priority
              sizes="(max-width:640px) 48px,
                     (max-width:768px) 80px,
                     (max-width:1024px) 112px,
                     144px"
              className="
                block h-auto w-12         /* phones ~48px */
                sm:w-20                   /* small tablets ~80px */
                md:w-28                   /* laptops ~112px */
                lg:w-36                   /* desktops ~144px */
                object-contain object-left-top
              "
            />
          </Link>
        </div>

        {/* 👇 This boundary satisfies Next’s requirement for useSearchParams */}
        <Suspense fallback={<div />}>{children}</Suspense>
      </body>
    </html>
  );
}
