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
   url?: string;
   embedItems?: { 
      itemType: "twitter" | "bsky"; 
      url?: string;
      handle?: string;
      id?: string;
   }[];
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

// Helper function to handle Bluesky URLs
const parseBskyUrl = (url: string): { handle: string; id: string } | null => {
   const regex = /https?:\/\/(.*?\.bsky\.social)\/post\/(.*)/;
   const match = url.match(regex);
   if (match) {
      return { handle: match[1], id: match[2] };
   }
   return null;
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

   // Initialize mediaItems array
   const mediaItems: MediaItem[] = [];

   // Process all media items
   const mediaItemKeys = Object.keys(reqData).filter(key => 
      key.startsWith("content[media][mediaItems]")
   );

   // Determine the date to use
   const date = changelogDate
      ? formatDate(new Date(changelogDate), "do MMM, yyyy H:m")
      : formatDate(new TZDate(new Date(), "Asia/Calcutta"), "do MMM, yyyy H:m");

   // Upload images and process embeds
   for (const key of mediaItemKeys) {
      const item = reqData[key];
      
      if (item instanceof File) {
         // Handle image file
         const imageUrl = await uploadToR2(
            c.env.r2_buckets,
            c.env.R2_ACCOUNT_ID,
            date,
            [item]
         );
         if (imageUrl.length > 0) {
            mediaItems.push({ type: "image", url: imageUrl[0] });
         }
      } else if (typeof item === "string") {
         // Handle embed
         try {
            const embedData = JSON.parse(item);
            if (embedData.type === "embed") {
               // Check for Twitter embed
               if (embedData.platform === "twitter") {
                  mediaItems.push({
                     type: "embed",
                     embedItems: [{ itemType: "twitter", url: embedData.url }]
                  });
               }
               // Check for Bluesky embed
               else if (embedData.platform === "bsky") {
                  const parsed = parseBskyUrl(embedData.url);
                  if (parsed) {
                     mediaItems.push({
                        type: "embed",
                        embedItems: [{ itemType: "bsky", handle: parsed.handle, id: parsed.id }]
                     });
                  }
               }
            }
         } catch (error) {
            console.error("Error parsing embed data:", error);
         }
      }
   }

   // Check if there are any images or embeds
   const isImageAvailable = mediaItems.some(item => item.type === "image");
   const isEmbedAvailable = mediaItems.some(item => item.type === "embed");

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
