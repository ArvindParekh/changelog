"use client";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/app/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignupFormDemo() {
   const { data: session, status } = useSession();
   const router = useRouter();
   const [userLog, setUserLog] = useState<string>("");
   const [logTime, setLogTime] = useState<string | undefined>("");

   // Redirect to login if the user is not authenticated
   const handleLogin = () => {
      router.push("/api/auth/signin");
   };

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
      formData.append("content[date]", logTime);

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
      <main className='md:flex md:items-center md:justify-center md:h-screen md:w-screen bg-black'>
         {status === "authenticated" ? (
            <div className='max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black md:border border-white md:!border-opacity-20'>
               <h2 className='font-bold text-xl text-neutral-800 dark:text-neutral-200'>
                  Welcome to my Changelog
               </h2>
               <p className='text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300'>
                  Got some news to share? Add a new highlight!
               </p>

               <form className='my-8' onSubmit={handleUpload}>
                  <div className='flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4'>
                     <LabelInputContainer>
                        <Label htmlFor='date'>Date (Optional)</Label>
                        <Input
                           id='date'
                           type='datetime-local'
                           name='date'
                           onChange={(e) => setLogTime(e.target.value)}
                        />
                        <p className='text-white text-xs font-medium'>
                           (Leave it empty to default to the current time)
                        </p>
                     </LabelInputContainer>
                  </div>
                  <LabelInputContainer className='mb-4'>
                     <Label htmlFor='log'>Log</Label>
                     <Input
                        id='log'
                        placeholder='Saw a shark today ...'
                        type='text'
                        name='text'
                        value={userLog}
                        onChange={(e) => setUserLog(e.target.value)}
                        required
                     />
                  </LabelInputContainer>
                  <LabelInputContainer className='mb-4'>
                     <Label htmlFor='image'>Image (optional)</Label>
                     <Input
                        id='image'
                        type='file'
                        accept='image/*'
                        name='filename'
                     />
                  </LabelInputContainer>

                  <div className='bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full' />

                  <button
                     className='bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]'
                     type='submit'
                  >
                     Add Log &rarr;
                     <BottomGradient />
                  </button>
               </form>
            </div>
         ) : (
            <button
               className='p-2 border rounded-md bg-white text-black'
               onClick={handleLogin}
            >
               Log In
            </button>
         )}
      </main>
   );
}

const BottomGradient = () => {
   return (
      <>
         <span className='group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent' />
         <span className='group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent' />
      </>
   );
};

const LabelInputContainer = ({
   children,
   className,
}: {
   children: React.ReactNode;
   className?: string;
}) => {
   return (
      <div className={cn("flex flex-col space-y-2 w-full", className)}>
         {children}
      </div>
   );
};
