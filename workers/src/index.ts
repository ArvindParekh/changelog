import { Hono } from "hono";
import { cors } from "hono/cors";
import { TZDate } from "@date-fns/tz";
import { formatDate, parse } from "date-fns";

type Bindings = {
   changelog_kv: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

export interface Env {
   changelog_kv: KVNamespace;
}

app.get("/", async (c) => {
   const lists = await c.env.changelog_kv.list();

   const changelogArr: object[] = [];

   await Promise.all(
      lists.keys.map(async (list) => {
         const value = await c.env.changelog_kv.get(`${list.name}`);
         // const resolvedValue = Promise.resolve(value);
         const newEntry = {
            date: list.name,
            text: value,
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
      let dateB = parse(b.date, "do MMM, yyyy HH:mm", new TZDate(new Date(), "Asia/Calcutta"));

      return dateA - dateB;
   });

   return c.json(JSON.stringify(changelogArr), {
      headers: { "Content-Type": "application/json" },
   });
});

app.post("/", async (c) => {
   const reqData = await c.req.json();
   console.log(reqData);
   const changelogText = reqData.data.text;
   const changelogDate = reqData.data.date;

   console.log(formatDate(new TZDate(new Date(), 'Asia/Calcutta'), "do MMM, yyyy H:m"));

   if (!changelogDate || changelogDate == "") {
      await c.env.changelog_kv
         .put(
            `${formatDate(new TZDate(new Date(), "Asia/Calcutta"), "do MMM, yyyy H:m")}`,
            `${changelogText}`
         )
         .then(() => {
            console.log("Done");
         })
         .catch((err) => console.log(err));
   } else {
      await c.env.changelog_kv
         .put(
            `${formatDate(changelogDate, "do MMM, yyyy H:m")}`,
            `${changelogText}`
         )
         .then(() => {
            console.log("Done");
         });
   }
   return c.json("Changelog added succesfully!");
});

export default app;
