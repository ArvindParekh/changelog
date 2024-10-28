import { Hono } from "hono";
import { cors } from "hono/cors";
import { TZDate } from "@date-fns/tz";
import { format as formatDate, parse } from "date-fns";

type Bindings = {
   changelog_kv: KVNamespace;
   r2_buckets: R2Bucket;
   R2_ACCOUNT_ID: string;
};

type MediaItem = {
   type: "image" | "embed";
   url: string;
};

type ChangelogEntry = {
   date: string;
   text: string | null;
   media: {
      isImageAvailable: boolean;
      isEmbedAvailable: boolean;
      mediaItems: MediaItem[];
   };
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

// Helper function to construct image URL
const getImageUrl = (accountId: string, fileName: string): string => {
   const encodedFileName = fileName
      .replaceAll(" ", "%20")
      .replace(",", "%2C")
      .replace(":", "%3A");
   return `https://pub-${accountId}.r2.dev/${encodedFileName}`;
};

// Helper function to upload files to R2 and return URLs
const uploadToR2 = async (
   r2Bucket: R2Bucket,
   accountId: string,
   fileName: string,
   files: File[]
): Promise<string[]> => {
   const urls: string[] = [];

   for (const [index, file] of files.entries()) {
      const key = `${fileName}-img${index}`;
      await r2Bucket.put(key, file);
      const url = getImageUrl(accountId, key);
      urls.push(url);
      console.log(`Image uploaded to R2 with key: ${key}`);
   }
   return urls;
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
   const changelogArr: ChangelogEntry[] = [];

   // Process each changelog entry
   await Promise.all(
      kvKeys.keys.map(async (kvEntry) => {
         const changelogData = await c.env.changelog_kv.get(kvEntry.name);
         console.log(changelogData)
         if (changelogData) {
            const parsedData: ChangelogEntry = JSON.parse(changelogData);
            // console.log(parsedData);

            // Add each parsed changelog entry to the array
            changelogArr.push({
               date: parsedData.date,
               text: parsedData.text,
               media: {
                  isImageAvailable: parsedData.media.isImageAvailable,
                  isEmbedAvailable: parsedData.media.isEmbedAvailable,
                  mediaItems: parsedData.media.mediaItems,
               },
            });
         }
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

   // Extract images from reqData
   const changelogImages = Object.keys(reqData)
      .filter((key) => key.startsWith("images["))
      .map((key) => reqData[key] as File);

   const changelogEmbeds = Object.keys(reqData)
      .filter((key) => key.startsWith("embeds["))
      .map((key) => reqData[key] as { url: string; platform: string });

   console.log(changelogEmbeds);

   // Determine the date to use
   const date = changelogDate
      ? formatDate(new Date(changelogDate), "do MMM, yyyy H:m")
      : formatDate(new TZDate(new Date(), "Asia/Calcutta"), "do MMM, yyyy H:m");

   // Upload images to R2 and get URLs
   const imageUrls = await uploadToR2(
      c.env.r2_buckets,
      c.env.R2_ACCOUNT_ID,
      date,
      changelogImages
   );

   // Check if there are any images or embeds
   const isImageAvailable = imageUrls.length > 0;
   const isEmbedAvailable = changelogEmbeds.length > 0;

   // Construct media array from images and embeds
   const mediaItems: MediaItem[] = [
      ...imageUrls.map((url) => ({ type: "image", url })),
      ...changelogEmbeds.map((embed) => ({
         type: "embed",
         url: embed,
         // platform: embed.platform, // If needed, uncomment this line
      })),
   ];

   // Construct the changelog entry data
   const changelogEntry: ChangelogEntry = {
      date,
      text: changelogText,
      media: {
         isImageAvailable,
         isEmbedAvailable,
         mediaItems,
      },
   };

   // Upload changelog entry to KV as a JSON string
   await uploadToKV(c.env.changelog_kv, date, JSON.stringify(changelogEntry));

   return c.json({ message: "Changelog added successfully!" });
});

export default app;
