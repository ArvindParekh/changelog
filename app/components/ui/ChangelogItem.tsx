"use client";
import React from 'react';
import Image from "next/image";
import { Tweet } from 'react-tweet';
import { Post } from "bsky-react-post";
import "../../styles/bsky-embed.css";
import { cn } from "@/app/lib/utils";

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

type ChangelogData = {
   date: string;
   text: string | null;
   media: {
      isImageAvailable: boolean;
      isEmbedAvailable: boolean;
      mediaItems: MediaItem[];
   };
};

interface ChangelogItemProps {
   item: ChangelogData;
   onTweetLoad: () => void;
   onEmbedLoad: () => void;
}

const ChangelogItem: React.FC<ChangelogItemProps> = ({ item, onTweetLoad, onEmbedLoad }) => {
   const getTweetId = (url: string): string => {
      const matches = url.match(/\/status\/(\d+)/);
      return matches ? matches[1] : '';
   };
   const hasMedia = item.media.isImageAvailable || item.media.isEmbedAvailable;

   return (
      <article className='flex justify-start pt-8 md:pt-24 md:gap-8'>
         <div className='sticky z-40 flex max-w-xs flex-col items-center self-start md:w-full md:max-w-sm md:flex-row top-28 md:top-32'>
            <div className='absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-black md:left-3'>
               <div className='h-3.5 w-3.5 rounded-full border border-neutral-600 bg-neutral-800 shadow-[0_0_0_4px_rgba(0,0,0,0.65)]' />
            </div>
            <h3 className='hidden md:block md:pl-20 text-2xl md:text-5xl font-semibold tracking-tight text-neutral-500/90'>
               {item.date}
            </h3>
         </div>

         <div className='relative w-full pl-20 pr-4 md:pl-4'>
            <h3 className='mb-3 block text-2xl font-semibold tracking-tight text-neutral-500 md:hidden'>
               {item.date}
            </h3>
            <div
               className={cn(
                  "inline-block w-fit max-w-full rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4 md:p-6",
                  hasMedia ? "md:max-w-[42rem]" : "md:max-w-[52rem]"
               )}
            >
               <p className='mb-6 text-sm font-normal leading-relaxed text-neutral-200 md:max-w-[64ch] md:text-[15px]'>
                  {item.text}
               </p>
               {(item.media.isImageAvailable || item.media.isEmbedAvailable) && (
                  <div className='inline-grid w-fit max-w-full grid-cols-1 gap-5'>
                     {item.media.mediaItems.map((mediaItem, idx) => {
                        if (mediaItem.type === "image" && item.media.isImageAvailable) {
                           return (
                              <div key={idx} className='relative aspect-square w-full max-w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 sm:w-[22rem] md:w-[30rem]'>
                                 <Image
                                    src={mediaItem.url!}
                                    alt='media item'
                                    sizes='(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 50vw'
                                    fill
                                    className='object-contain p-1'
                                 />
                              </div>
                           );
                        } else if (mediaItem.type === "embed" && item.media.isEmbedAvailable) {
                           return (
                              <div key={idx} className='w-full'>
                                 {mediaItem.embedItems?.map((embed, embedIdx) => {
                                    if (embed.itemType === "twitter") {
                                       const tweetId = getTweetId(embed.url);
                                       return (
                                          <div key={embedIdx} className='w-fit max-w-full overflow-hidden rounded-xl border border-neutral-900 sm:max-w-[560px]' onLoad={onTweetLoad}>
                                             <Tweet id={tweetId} />
                                          </div>
                                       );
                                    } else if (embed.itemType === "bsky") {
                                       onEmbedLoad();
                                       return (
                                          <div key={embedIdx} className='w-fit max-w-full overflow-hidden rounded-xl border border-neutral-900 sm:max-w-[560px]'>
                                             <Post handle={embed.handle!} id={embed.id!} />
                                          </div>
                                       );
                                    }
                                    return null;
                                 })}
                              </div>
                           );
                        }
                        return null;
                     })}
                  </div>
               )}
            </div>
         </div>
      </article>
   );
};

export default ChangelogItem; 
