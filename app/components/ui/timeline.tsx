"use client";
import axios from "axios";
import {
   useScroll,
   useTransform,
   motion,
} from "framer-motion";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import ChangelogItem from './ChangelogItem';
import Link from "next/link";
import ChangelogHeader from './ChangelogHeader';

type MediaItem = {
   type: "image" | "embed";
   url: string;
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
   const [loadedTweets, setLoadedTweets] = useState(0);
   const totalTweets = useRef(0);
   const [allContentLoaded, setAllContentLoaded] = useState(false);

   useEffect(() => {
      const loadData = async () => {
         try {
            const response = await axios.get("https://workers.aruparekh2.workers.dev/");
            const fetchData: ChangelogData[] = response.data;
            setData(fetchData);
            totalTweets.current = fetchData.reduce((count, item) => 
               count + item.media.mediaItems.filter(m => 
                  m.type === "embed" && 
                  m.url.match(/^https?:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+/)
               ).length, 0
            );

            if (totalTweets.current === 0) {
               setAllContentLoaded(true);
            }
            if (ref.current) {
               const rect = ref.current.getBoundingClientRect();
               setHeight(rect.height);
            }
         } catch (error) {
            console.error("Error fetching data:", error);
         }
      };

      loadData();
   }, []);

   useEffect(() => {
      if (ref.current && allContentLoaded) {
         const rect = ref.current.getBoundingClientRect();
         setHeight(rect.height);
      }
   }, [ref, allContentLoaded, data]);

   const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start 10%", "end 90%"],
   });

   const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
   const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

   const handleTweetLoad = () => {
      setLoadedTweets(prev => prev + 1);
      if (ref.current) {
         const rect = ref.current.getBoundingClientRect();
         setHeight(rect.height);
      }
   };

   const handleEmbedLoad = () => {
      if (ref.current) {
         const rect = ref.current.getBoundingClientRect();
         setHeight(rect.height);
      }
   };

   useEffect(() => {
      if (ref.current) {
         const rect = ref.current.getBoundingClientRect();
         setHeight(rect.height);
      }
   }, [data, loadedTweets]);

   return (
      <div className='w-full bg-black md:px-10' ref={containerRef}>
         <ChangelogHeader />

         <div ref={ref} className='relative max-w-7xl mx-auto px-1 pb-24 bg-black'>
            {data.toReversed().map((item, index) => (
               <ChangelogItem 
                  key={index} 
                  item={item} 
                  onTweetLoad={handleTweetLoad} 
                  onEmbedLoad={handleEmbedLoad}
               />
            ))}
            <div
               style={{ height: height + "px" }}
               className='absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent via-neutral-800 to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] '
            >
               <motion.div
                  style={{
                     height: heightTransform,
                     opacity: opacityTransform,
                  }}
                  className='absolute inset-x-0 top-0 w-[2px] bg-gradient-to-b from-neutral-100 via-neutral-300/80 to-transparent rounded-full'
               />
            </div>
         </div>

         {status === "authenticated" ? (
            <Link href={"/new-log"} className='fixed bottom-5 right-5 rounded-full border border-neutral-700 bg-neutral-900/90 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_32px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-neutral-500'>
               New log
            </Link>
         ) : (
            <Link href={"/api/auth/signin"} className='fixed bottom-5 right-5 rounded-full border border-neutral-700 bg-neutral-900/90 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_32px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-neutral-500'>
               Authenticate
            </Link>
         )}
      </div>
   );
};
