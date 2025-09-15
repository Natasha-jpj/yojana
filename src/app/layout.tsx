// src/app/layout.tsx
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

// ✅ proper mobile viewport (Next App Router way)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      {/* ✅ prevent horizontal scroll + respect mobile safe areas */}
      <body className="m-0 p-0 min-h-[100svh] overflow-x-hidden antialiased">
        <div
          className="fixed z-[9999]"
          style={{ top: "max(0.5rem, env(safe-area-inset-top))", left: "max(0.5rem, env(safe-area-inset-left))" }}
        >
          <Link href="/?start=1" aria-label="Start plan" className="block">
            <Image
              src="/LOGO-removebg-preview.png"
              alt="Yojana logo"
              width={160}
              height={160}
              priority
              // ✅ smaller on phones, bigger on larger screens
              className="block object-contain w-24 h-24 sm:w-40 sm:h-40"
            />
          </Link>
        </div>

        {children}
      </body>
    </html>
  );
}
