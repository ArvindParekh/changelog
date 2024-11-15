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
   const [tweetUrl, setTweetUrl] = useState('')

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
         formData.append(`images[${index}]`, file);
      });

      // Filter out empty embeds and append valid ones
      embeds
         .filter(embed => embed.trim() !== '')
         .forEach((embed, index) => {
            formData.append(`embeds[${index}]`, JSON.stringify({
               type: "embed",
               url: embed
            }));
         });

      try {
         const response = await axios.post(
            // "http://localhost:8787/",
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


   // return (
   //    <div className='flex items-center justify-center min-h-screen'>
   //       {status === "authenticated" ? (
   //          <main className='flex flex-col space-y-10 items-center justify-center p-5'>
   //             <form onSubmit={handleUpload}>
   //                <div className='flex flex-col gap-2 items-center'>
   //                   <label htmlFor='date'>Pick a date</label>
   //                   <input
   //                      className='text-black p-2 rounded-md'
   //                      type='datetime-local'
   //                      name='date'
   //                      onChange={(e) => setLogTime(e.target.value)}
   //                   />
   //                   <p>or keep it empty to default to the current time</p>
   //                </div>

   //                <div className='flex flex-col gap-2 items-center'>
   //                   <label htmlFor='text'>Enter log</label>
   //                   <input
   //                      className='text-black p-2 rounded-md'
   //                      type='text'
   //                      name='text'
   //                      value={userLog}
   //                      onChange={(e) => setUserLog(e.target.value)}
   //                      required
   //                   />

   //                   <div>
   //                      <input
   //                         type='file'
   //                         accept='image/*'
   //                         name='filename' // used to access the file in handleUpload
   //                      />
   //                   </div>

   //                   <button
   //                      className='p-2 border rounded-md bg-white text-black'
   //                      type='submit'
   //                   >
   //                      Add Log
   //                   </button>
   //                </div>
   //             </form>
   //          </main>
   //       ) : (
   //          <button className='p-2 border rounded-md' onClick={handleLogin}>
   //             Log In
   //          </button>
   //       )}
   //    </div>
   // );
// }
