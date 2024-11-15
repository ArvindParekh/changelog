"use client";
import React from 'react';
import Image from "next/image";
import { Tweet } from 'react-tweet';

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

interface ChangelogItemProps {
   item: ChangelogData;
   onTweetLoad: () => void;
}

const ChangelogItem: React.FC<ChangelogItemProps> = ({ item, onTweetLoad }) => {
   const getTweetId = (url: string): string => {
      const matches = url.match(/\/status\/(\d+)/);
      return matches ? matches[1] : '';
   };

   return (
      <div className='flex justify-start pt-10 md:pt-40 md:gap-10'>
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
               {(item.media.isImageAvailable || item.media.isEmbedAvailable) && (
                  <div className='grid grid-cols-1 gap-4'>
                     {item.media.mediaItems.map((mediaItem, idx) => {
                        if (mediaItem.type === "image" && item.media.isImageAvailable) {
                           return (
                              <div key={idx} className='relative aspect-square w-full md:w-1/2'>
                                 <Image
                                    src={mediaItem.url}
                                    alt='media item'
                                    sizes='(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 50vw'
                                    fill
                                    className='rounded-lg object-contain shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
                                 />
                              </div>
                           );
                        } else if (mediaItem.type === "embed" && item.media.isEmbedAvailable) {
                           const isTweetUrl = mediaItem.url.match(/^https?:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+/);
                           if (isTweetUrl) {
                              const tweetId = getTweetId(mediaItem.url);
                              return (
                                 <div key={idx} className='w-full' onLoad={onTweetLoad}>
                                    <Tweet id={tweetId} />
                                 </div>
                              );
                           }
                           return null;
                        }
                        return null;
                     })}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default ChangelogItem; 