import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { formatDate, formatDistanceToNow } from "date-fns";

export const runtime = "edge";

export async function GET(request: NextRequest) {
   // In the edge runtime you can use Bindings that are available in your application
   // (for more details see:
   //    - https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#use-bindings-in-your-nextjs-application
   //    - https://developers.cloudflare.com/pages/functions/bindings/
   // )
   //
   // KV Example:
   const myKv = getRequestContext().env.changelog_kv;
   const lists = await myKv.list();

   const changelogArr: object[] = [];

   await Promise.all(
      lists.keys.map(async (list) => {
         const value = await myKv.get(`${list.name}`);
         // const resolvedValue = Promise.resolve(value);
         const newEntry = {
            date: list.name,
            text: value,
         };
         changelogArr.push(newEntry);
      })
   );

   return new Response(JSON.stringify(changelogArr), {
      headers: { "Content-Type": "application/json" },
   });
}

export async function POST(req: NextRequest) {
   const reqData = await req.json();
   const changelogText = reqData.text;

   console.log(changelogText);

   const myKv = getRequestContext().env.changelog_kv;
   console.log(formatDate(new Date(), "do MMM, yyyy H:m"));
   await myKv
      .put(`${formatDate(new Date(), "do MMM, yyyy H:m")}`, `${changelogText}`)
      .then(() => {
         console.log("Done");
      });
   return new Response("Changelog added succesfully!");
}
