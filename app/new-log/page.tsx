"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { ChangeEvent, useState } from "react";

export default function AddLog() {
   const session = useSession();
   const router = useRouter();
   const [userLog, setUserLog] = useState("");
   const [logTime, setLogTime] = useState();
   const [r2ImageUrl, setR2ImageUrl] = useState("");

   function handlelogin() {
      router.push("/api/auth/signin");
   }

   function handleSubmit() {
      // check if log is empty
      if (userLog === "") {
         alert("Dude, the log is empty. Seriously?");
         return null;
      }
      ("handleSubmit called");
      // axios
      //    .post("https://workers.aruparekh2.workers.dev/", {
      //       data: {
      //          date: logTime,
      //          text: userLog,
      //       },
      //    })
      axios
         .post("https://workers.aruparekh2.workers.dev/", {
            data: {
               date: logTime,
               text: userLog,
            },
         })
         .then((response) => {
            console.log("Post request successful:", response);

            router.push("/");
         })
         .catch((error) => {
            console.log("Post request error:", error);
         });
      return null;
   }

   const handleUpload = async (event) => {
      event.preventDefault();

      const form = event.target;
      const file = form.filename.files[0];

      if (!file) return;

      const formData = new FormData();
      formData.append("filename", file);
      formData.append("content[text]", form.text.value);
      formData.append("content[date]", form.date.value);

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

         console.log(response);
      } catch (error) {
         console.error("Error uploading file:", error);
      }
   };

   return (
      <div className='flex items-center justify-center'>
         {session.status === "authenticated" ? (
            <main className='flex min-h-screen space-y-10 items-center justify-center flex-col p-5'>
               <form onSubmit={handleUpload}>
                  <div className='flex flex-col gap-2 items-center'>
                     <label>Pick a date</label>
                     <input
                        className='text-black p-2 rounded-md'
                        type='datetime-local'
                        name='date'
                        onChange={(e) => {
                           console.log(e.target.value);
                           return setLogTime(e.target.value);
                        }}
                     ></input>

                     <h1>or keep it empty to default to the current time</h1>
                  </div>
                  <div className='flex flex-col gap-2 items-center'>
                     <label>Enter log</label>
                     <input
                        className='text-black p-2 rounded-md'
                        type='text'
                        name='text'
                        onChange={(e) => setUserLog(e.target.value)}
                     />
                     <div>
                        <input
                           type='file'
                           accept='image/*'
                           name='filename' // This name is used to access the file in handleUpload
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
            <button onClick={() => handlelogin()}>LogIn</button>
         )}
      </div>
   );
}
