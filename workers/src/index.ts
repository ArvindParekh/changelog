import { Hono } from "hono";
import { cors } from "hono/cors";
import { TZDate } from "@date-fns/tz";
import { format as formatDate, parse } from "date-fns";

type Bindings = {
   changelog_kv: KVNamespace;
   r2_buckets: R2Bucket;
   R2_ACCOUNT_ID: string;
};

type ChangelogEntry = {
   date: string;
   text: string | null;
   image: {
      isImageAvailable: boolean;
      imageUrl: string;
   };
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

export interface Env {
   changelog_kv: KVNamespace;
}

// Helper function to construct image URL
const getImageUrl = (accountId: string, fileName: string): string => {
   const encodedFileName = fileName
      .replaceAll(" ", "%20")
      .replace(",", "%2C")
      .replace(":", "%3A");
   return `https://pub-${accountId}.r2.dev/${encodedFileName}`;
};

// Helper function to upload file to R2
const uploadToR2 = async (
   r2Bucket: R2Bucket,
   key: string,
   file: File | null
): Promise<void> => {
   if (file) {
      await r2Bucket.put(key, file);
      console.log(`Image uploaded to R2 with key: ${key}`);
   } else {
      console.log("No image found. Not uploading to R2.");
   }
};

// Helper function to upload changelog to KV
const uploadToKV = async (
   kvNamespace: KVNamespace,
   key: string,
   value: string
): Promise<void> => {
   try {
      await kvNamespace.put(key, value);
      console.log(`Changelog text uploaded to KV with key: ${key}`);
   } catch (err) {
      console.error("Error uploading to KV:", err);
   }
};

// GET handler: Fetch and return the changelog
app.get("/", async (c) => {
   const kvKeys = await c.env.changelog_kv.list();
   const r2Objects = (await c.env.r2_buckets.list()).objects.map(
      (obj) => obj.key
   );
   const changelogArr: ChangelogEntry[] = [];
   const imageBaseUrl = `https://pub-${c.env.R2_ACCOUNT_ID}.r2.dev/`;

   // Process each changelog entry
   await Promise.all(
      kvKeys.keys.map(async (kvEntry) => {
         const changelogText = await c.env.changelog_kv.get(kvEntry.name);
         const isImageAvailable = r2Objects.includes(kvEntry.name);
         const imageUrl = getImageUrl(c.env.R2_ACCOUNT_ID, kvEntry.name);

         changelogArr.push({
            date: kvEntry.name,
            text: changelogText,
            image: {
               isImageAvailable,
               imageUrl,
            },
         });
      })
   );

   // Sort changelog entries by date
   changelogArr.sort((a, b) => {
      const dateA = parse(
         a.date,
         "do MMM, yyyy HH:mm",
         new TZDate(new Date(), "Asia/Calcutta")
      );
      const dateB = parse(
         b.date,
         "do MMM, yyyy HH:mm",
         new TZDate(new Date(), "Asia/Calcutta")
      );
      return dateA.getTime() - dateB.getTime();
   });

   return c.json(changelogArr, {
      headers: { "Content-Type": "application/json" },
   });
});

// POST handler: Add a new changelog entry
app.post("/", async (c) => {
   const reqData = await c.req.parseBody();
   const changelogText = reqData["content[text]"] as string;
   const changelogDate = (reqData["content[date]"] as string) || "";
   const changelogImage = reqData["filename"] as File | null;

   // Determine the date to use
   const date = changelogDate
      ? formatDate(changelogDate, "do MMM, yyyy H:m")
      : formatDate(new TZDate(new Date(), "Asia/Calcutta"), "do MMM, yyyy H:m");

   // Upload to R2 and KV
   await uploadToR2(c.env.r2_buckets, date, changelogImage);
   await uploadToKV(c.env.changelog_kv, date, changelogText);

   return c.json({ message: "Changelog added successfully!" });
});

export default app;
