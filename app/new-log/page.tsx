"use client";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/authOptions";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AddLog() {
   const session = useSession();
   const router = useRouter();

   function handlelogin() {
      router.push("/api/auth/signin");
   }
   return (
      <div>
         {session.status === "authenticated" ? (
            <main className='flex min-h-screen items-center justify-center border flex-col p-5'>
               <input className='dark:text-black' type='date'></input>
               <input className='dark:text-black' type='datetime-local'></input>
            </main>
         ) : (
            <button onClick={() => handlelogin()}>LogIn</button>
         )}
      </div>
   );
}
