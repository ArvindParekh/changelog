import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

// const spaceMono = Space_Mono({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
   title: "arvind.changelog",
   description: "My Personal Changelog",
   icons: {
      icon: "/icon.svg",
   }
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="en" className="dark">
         <body className="dark:bg-black">
            <Providers>{children}</Providers>
         </body>
      </html>
   );
}
