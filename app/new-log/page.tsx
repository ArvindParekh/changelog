"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useState } from "react";

export default function AddLog() {
   const session = useSession();
   const router = useRouter();
   const [userLog, setUserLog] = useState("");
   const [logTime, setLogTime] = useState();

   function handlelogin() {
      router.push("/api/auth/signin");
   }

   function handleSubmit() {
      ("handleSubmit called");
      axios
         .post("http://localhost:3000/api", {
            data: {
               text: userLog,
               date: logTime,
            },
         })
         .then((response) => {
            console.log("Post request successful:", response);

            router.push('/')
         })
         .catch((error) => {
            console.log("Post request error:", error);
         });
      return null;
   }
   return (
      <div className='flex items-center justify-center'>
         {session.status === "authenticated" ? (
            <main className='flex min-h-screen space-y-10 items-center justify-center flex-col p-5'>
               <div className='flex flex-col gap-2 items-center'>
                  <label>Pick a date</label>
                  <input
                     className='text-black p-2 rounded-md'
                     type='datetime-local'
                     onChange={(e) => {
                        console.log(e.target.value);
                        return setLogTime(e.target.value);
                     }}
                  ></input>

                  <h1>or</h1>

                  <label>Now Time</label>
               </div>
               <div className='flex flex-col gap-2 items-center'>
                  <label>Enter log</label>
                  <input
                     className='text-black p-2 rounded-md'
                     type='text'
                     onChange={(e) => setUserLog(e.target.value)}
                  />
               </div>
               <button
                  className='p-2 border rounded-md bg-white text-black'
                  onClick={handleSubmit}
               >
                  Add Log
               </button>
            </main>
         ) : (
            <button onClick={() => handlelogin()}>LogIn</button>
         )}
      </div>
   );
}
