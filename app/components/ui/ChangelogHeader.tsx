"use client";
import React from 'react';

const ChangelogHeader = () => (
   <header className='max-w-7xl mx-auto px-4 pt-16 pb-8 md:px-8 md:pt-20 md:pb-12 lg:px-10'>
      <span className='inline-flex rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400'>
         Journey Notes
      </span>
      <h2 className='mt-5 max-w-4xl text-3xl font-semibold leading-[1.08] text-white md:text-5xl'>
         Changelog from my journey
      </h2>
      <p className='mt-4 max-w-xl text-sm leading-relaxed text-neutral-400 md:text-base'>
         Still figuring things out. Here&apos;s the highlight reel.
      </p>
   </header>
);

export default ChangelogHeader; 
