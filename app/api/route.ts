import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

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
         const newEntry = {
            date: list.name,
            text: value,
         };
         changelogArr.push(newEntry);
      })
   );

   console.log("Final changelog array: ", changelogArr);
   return new Response(JSON.stringify(changelogArr), {
      headers: { "Content-Type": "application/json" },
   });
}

export async function POST(req: NextRequest) {
   console.log("herhehre");
   const reqData = await req.json();
   const changelogText = reqData.text;

   console.log(changelogText);

   const myKv = getRequestContext().env.changelog_kv;
   const nowTime = new Date();
   console.log(nowTime);
   await myKv.put(`${nowTime}`, `${changelogText}`).then(() => {
      console.log("Done");
   });
   return new Response("Changelog added succesfully!");
}
