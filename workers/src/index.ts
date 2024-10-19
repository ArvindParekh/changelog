import { Hono } from "hono";
import { cors } from "hono/cors";
import { TZDate } from "@date-fns/tz";
import { formatDate, parse } from "date-fns";

type Bindings = {
   changelog_kv: KVNamespace;
   r2_buckets: R2Bucket;
   R2_ACCOUNT_ID: Env;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

export interface Env {
   changelog_kv: KVNamespace;
}

app.get("/", async (c) => {
   const lists = await c.env.changelog_kv.list();
   const r2_list = (await c.env.r2_buckets.list()).objects.map(
      (obj) => obj.key
   );

   const changelogArr: object[] = [];
   const imageBaseUrl = `https://pub-${c.env.R2_ACCOUNT_ID}.r2.dev/`;

   await Promise.all(
      lists.keys.map(async (list) => {
         const value = await c.env.changelog_kv.get(`${list.name}`);
         const isImage = r2_list.includes(list.name);
         // const resolvedValue = Promise.resolve(value);
         const imageUrl =
            imageBaseUrl +
            `${list.name
               .replaceAll(" ", "%20")
               .replace(",", "%2C")
               .replace(":", "%3A")}`;

         const newEntry = {
            date: list.name,
            text: value,
            image: {
               isImage,
               imageUrl,
            },
         };
         changelogArr.push(newEntry);
      })
   );

   // sorting the dates in ascending order
   changelogArr.sort((a, b) => {
      let dateA = parse(
         a.date,
         "do MMM, yyyy HH:mm",
         new TZDate(new Date(), "Asia/Calcutta")
      );
      let dateB = parse(
         b.date,
         "do MMM, yyyy HH:mm",
         new TZDate(new Date(), "Asia/Calcutta")
      );

      return dateA - dateB;
   });

   return c.json(JSON.stringify(changelogArr), {
      headers: { "Content-Type": "application/json" },
   });
});

app.post("/", async (c) => {
   const reqData = await c.req.parseBody();
   console.log(reqData);
   const changelogText = reqData["content[text]"];
   const changelogDate = reqData["content[date]"] || "";
   const changelogImage = reqData["filename"];

   if (!changelogDate || changelogDate == "") {
      const date = formatDate(
         new TZDate(new Date(), "Asia/Calcutta"),
         "do MMM, yyyy H:m"
      );

      //upload to r2
      if (changelogImage) {
         await c.env.r2_buckets.put(`${date}`, changelogImage);
      } else {
         console.log("No image found\nNot uploading to R2.");
      }

      //upload to kv
      await c.env.changelog_kv
         .put(`${date}`, `${changelogText}`)
         .then(() => {
            console.log("Done");
         })
         .catch((err) => console.log(err));
   } else {
      const date = formatDate(changelogDate, "do MMM, yyyy H:m");

      //upload to r2
      if (changelogImage) {
         await c.env.r2_buckets.put(`${date}`, changelogImage);
      } else {
         console.log("No image found. Not uploading to R2.");
      }

      //upload to kv
      await c.env.changelog_kv.put(`${date}`, `${changelogText}`).then(() => {
         console.log("Done");
      });
   }
   return c.json("Changelog added succesfully!");
});

export default app;
