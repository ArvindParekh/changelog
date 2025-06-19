import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// Here we use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
// (when running the application with `next dev`), for more information see:
// https://github.com/cloudflare/next-on-pages/blob/main/internal-packages/next-dev/README.md
if (process.env.NODE_ENV === "development") {
   await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
   typescript: {
      ignoreBuildErrors: true,
   },
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "pub-3c93c1439ff14a37a0cc0e43bec36992.r2.dev",
            port: "",
            pathname: "/**",
         },
      ],
   },
   headers: async () => {
      return [
         {
            source: "/(.*)",
            headers: [
               {
                  key: "X-Frame-Options",
                  value: "ALLOW-FROM https://arvind-tech.vercel.app/",
               },
               {
                  key: "Content-Security-Policy",
                  value: "frame-ancestors 'self' hhttps://arvind-tech.vercel.app/",
               },
               // {
               //    key: "X-Content-Type-Options",
               //    value: "nosniff",
               // },
               // {
               //    key: "Referrer-Policy",
               //    value: "no-referrer",
               // },
            ],
         },
      ];
   },
};

export default nextConfig;
