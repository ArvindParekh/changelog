"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useState } from "react";
import SignupFormDemo from "../components/example/signup-form-demo";

export default function AddLog() {
   const { data: session, status } = useSession();
   const router = useRouter();
   const [userLog, setUserLog] = useState<string>("");
   const [logTime, setLogTime] = useState<string | undefined>("");
   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
   const [embeds, setEmbeds] = useState<string[]>([""]);

   // Redirect to login if the user is not authenticated
   const handleLogin = () => {
      router.push("/api/auth/signin");
   };

   // Handle form submission to upload log data
   const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (userLog.trim() === "") {
         alert("Dude, the log is empty. Seriously?");
         return;
      }

      const formData = new FormData();
      formData.append("content[text]", userLog);
      formData.append("content[date]", logTime || new Date().toISOString());

      // Append multiple files to the form data
      selectedFiles.forEach((file, index) => {
         formData.append(`content[media][mediaItems][${index}]`, file);
      });

      // Filter out empty embeds and append valid ones
      embeds
         .filter(embed => embed.trim() !== '')
         .forEach((embed, index) => {
            formData.append(`content[media][mediaItems][${selectedFiles.length + index}]`, JSON.stringify({
               type: "embed",
               platform: embed.includes("twitter") ? "twitter" : "bsky", // Determine platform
               url: embed
            }));
         });

      // Set media availability flags
      formData.append("content[media][isImageAvailable]", String(selectedFiles.length > 0));
      formData.append("content[media][isEmbedAvailable]", String(embeds.length > 0));

      try {
         const response = await axios.post(
            "https://workers.aruparekh2.workers.dev/",
            formData,
            {
               headers: {
                  "Content-Type": "multipart/form-data",
               },
            }
         );
         console.log("File upload successful:", response);
         router.push("/");
      } catch (error) {
         console.error("Error uploading file:", error);
      }
   };

   // Handle file selection for multiple images
   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
         setSelectedFiles(Array.from(event.target.files));
      }
   };

   // Handle embed URL changes
   const handleEmbedChange = (index: number, value: string) => {
      setEmbeds((prev) => {
         const updatedEmbeds = [...prev];
         updatedEmbeds[index] = value;
         return updatedEmbeds;
      });
   };

   // Add a new embed field
   const addEmbedField = () => setEmbeds((prev) => [...prev, ""]);

   return (
      <SignupFormDemo />
   );
}
