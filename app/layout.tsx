import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
   subsets: ["latin"],
   variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
   subsets: ["latin"],
   variable: "--font-display",
});

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
      <html lang="en" className='dark'>
         <body className={`${inter.variable} ${spaceGrotesk.variable} dark:bg-black`}>
            <Providers>{children}</Providers>
         </body>
      </html>
   );
}
