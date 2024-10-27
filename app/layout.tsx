import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

// const spaceMono = Space_Mono({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
   title: "arvind.changelog",
   description: "My Personal Changelog",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang='en'>
         <body className={inter.className}>
            <Providers>{children}</Providers>
         </body>
      </html>
   );
}
