"use client";
import axios from "axios";
import {
   useMotionValueEvent,
   useScroll,
   useTransform,
   motion,
} from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

type MediaItem = {
   type: "image" | "embed";
   url: string;
   // platform?: string;
};

type ChangelogData = {
   date: string;
   text: string | null;
   media: {
      isImageAvailable: boolean;
      isEmbedAvailable: boolean;
      mediaItems: MediaItem[];
   };
};

export const Timeline = () => {
   const ref = useRef<HTMLDivElement>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const [height, setHeight] = useState(0);
   const { status } = useSession();
   const [data, setData] = useState<ChangelogData[]>([]);
   const [isMounted, setIsMounted] = useState(false); // New state

   useEffect(() => {
      const loadData = async () => {
         try {
            const response = await axios.get(
               // "http://localhost:8787/"
               "https://workers.aruparekh2.workers.dev/"
            );
            const fetchData: ChangelogData[] = response.data;
            setData(fetchData);
            setIsMounted(true);
         } catch (error) {
            console.error("Error fetching data:", error);
         }
      };

      loadData();
   }, []);

   useEffect(() => {
      if (ref.current && isMounted) {
         const rect = ref.current.getBoundingClientRect();
         setHeight(rect.height);
      }
   }, [ref, isMounted]);

   const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start 10%", "end 90%"],
   });

   const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
   const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

   return (
      <div
         className='w-full bg-neutral-950 font-sans md:px-10'
         ref={containerRef}
      >
         <div className='max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10'>
            <h2 className='text-lg md:text-4xl mb-4 text-white max-w-4xl'>
               Changelog from my journey
            </h2>
            <p className='text-neutral-300 text-sm md:text-base max-w-sm'>
               Still figuring things out &mdash; Here&apos;s the highlight reel!
            </p>
         </div>

         <div ref={ref} className='relative max-w-7xl mx-auto pb-20 bg-black'>
            {data.toReversed().map((item, index) => (
               <div
                  key={index}
                  className='flex justify-start pt-10 md:pt-40 md:gap-10'
               >
                  <div className='sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full'>
                     <div className='h-10 absolute left-3 md:left-3 w-10 rounded-full bg-black flex items-center justify-center'>
                        <div className='h-4 w-4 rounded-full bg-neutral-800 border border-neutral-700 p-2' />
                     </div>
                     <h3 className='hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500'>
                        {item.date}
                     </h3>
                  </div>

                  <div className='relative pl-20 pr-4 md:pl-4 w-full'>
                     <h3 className='md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500'>
                        {item.date}
                     </h3>
                     <div>
                        <p className='text-neutral-200 text-xs md:text-sm font-normal mb-8'>
                           {item.text}
                        </p>
                        {(item.media.isImageAvailable ||
                           item.media.isEmbedAvailable) && (
                           <div className='grid grid-cols-2 gap-4'>
                              {item.media.mediaItems.map((mediaItem, idx) => {
                                 return mediaItem.type === "image"
                                    ? item.media.isImageAvailable && (
                                         <div
                                            key={idx}
                                            className='relative aspect-square w-full'
                                         >
                                            <Image
                                               src={mediaItem.url}
                                               alt='media item'
                                               sizes='(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 50vw'
                                               fill
                                               className='rounded-lg object-contain shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
                                            />
                                         </div>
                                      )
                                    : // item.media.isEmbedAvailable && (
                                      //      <div
                                      //         key={idx}
                                      //         className='embed-container'
                                      //      >
                                      //         <iframe
                                      //            src={mediaItem.url}
                                      //            title='embed media item'
                                      //            className='rounded-lg shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
                                      //            width='100%'
                                      //            height='100%'
                                      //            allow='encrypted-media'
                                      //            frameBorder='0'
                                      //         />
                                      //      </div>
                                      //   );
                                      "";
                              })}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            ))}
            <div
               style={{
                  height: height + "px",
               }}
               className='absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] '
            >
               <motion.div
                  style={{
                     height: heightTransform,
                     opacity: opacityTransform,
                  }}
                  className='absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full'
               />
            </div>
         </div>

         {status === "authenticated" ? (
            <Link
               href={"/new-log"}
               className='p-2 bg-neutral-800 text-white rounded-lg fixed bottom-5 right-5'
            >
               New log
            </Link>
         ) : (
            <Link
               href={"/api/auth/signin"}
               className='p-2 bg-neutral-800 border border-neutral-700 outline-none text-white rounded-lg fixed bottom-5 right-5'
            >
               Authenticate
            </Link>
         )}
      </div>
   );
};
