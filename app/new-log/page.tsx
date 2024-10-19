"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useState } from "react";

export default function AddLog() {
   const { data: session, status } = useSession();
   const router = useRouter();
   const [userLog, setUserLog] = useState<string>("");
   const [logTime, setLogTime] = useState<string | undefined>("");

   // Redirect to login if the user is not authenticated
   const handleLogin = () => {
      router.push("/api/auth/signin");
   };

   // const handleSubmit = async () => {

   //    try {
   //       const logDate = logTime || new Date().toISOString(); // Default to current time if no date provided
   //       const response = await axios.post("https://workers.aruparekh2.workers.dev/", {
   //          data: {
   //             date: logDate,
   //             text: userLog,
   //          },
   //       });
   //       console.log("Post request successful:", response);
   //       router.push("/");
   //    } catch (error) {
   //       console.error("Post request error:", error);
   //    }
   // };
   

   // Submits the log data (date, text and image) to the server
   const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (userLog.trim() === "") {
         alert("Dude, the log is empty. Seriously?");
         return;
      }

      const form = event.target as HTMLFormElement;
      const fileInput = form.filename as HTMLInputElement;
      const file = fileInput?.files?.[0];

      if (!file) return;

      const formData = new FormData();
      formData.append("filename", file);
      formData.append("content[text]", userLog);
      formData.append("content[date]", logTime || new Date().toISOString());

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

   return (
      <div className='flex items-center justify-center min-h-screen'>
         {status === "authenticated" ? (
            <main className='flex flex-col space-y-10 items-center justify-center p-5'>
               <form onSubmit={handleUpload}>
                  <div className='flex flex-col gap-2 items-center'>
                     <label htmlFor='date'>Pick a date</label>
                     <input
                        className='text-black p-2 rounded-md'
                        type='datetime-local'
                        name='date'
                        onChange={(e) => setLogTime(e.target.value)}
                     />
                     <p>or keep it empty to default to the current time</p>
                  </div>

                  <div className='flex flex-col gap-2 items-center'>
                     <label htmlFor='text'>Enter log</label>
                     <input
                        className='text-black p-2 rounded-md'
                        type='text'
                        name='text'
                        value={userLog}
                        onChange={(e) => setUserLog(e.target.value)}
                        required
                     />

                     <div>
                        <input
                           type='file'
                           accept='image/*'
                           name='filename' // used to access the file in handleUpload
                        />
                     </div>

                     <button
                        className='p-2 border rounded-md bg-white text-black'
                        type='submit'
                     >
                        Add Log
                     </button>
                  </div>
               </form>
            </main>
         ) : (
            <button className='p-2 border rounded-md' onClick={handleLogin}>
               Log In
            </button>
         )}
      </div>
   );
}
