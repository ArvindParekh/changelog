"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Timeline } from "./components/ui/timeline";

type ChangelogData = {
   date: string;
   text: string;
   image: {
      isImageAvailable: boolean;
      imageUrl: string;
   };
};

export default function Home() {
   const [data, setData] = useState<ChangelogData[]>([]);

   useEffect(() => {
      const loadData = async () => {
         try {
            const response = await axios.get(
               "https://workers.aruparekh2.workers.dev/"
            );
            const fetchData: ChangelogData[] = response.data;
            setData(fetchData);
         } catch (error) {
            console.error("Error fetching data:", error);
         }
      };

      loadData();
   }, []);

   return (
      <div className='w-full'>
         <Timeline data={data} />
      </div>
   );
}

// return (
//    <main className='flex min-h-screen flex-col items-start p-5'>
//       {data.toReversed().map((changelog, index) => {
//          return (
//             <div key={index} className='changelog-entry'>
//                <span className='text-yellow'>{changelog.date}:</span>{" "}
//                <span className='text-yellow-500'>{changelog.text}</span>
//             </div>
//          );
//       })}

//       {session.status === "authenticated" ? (
//          <Link
//             href={"/new-log"}
//             className='p-2 bg-white text-black rounded-lg absolute bottom-5 right-5'
//          >
//             New log
//          </Link>
//       ) : (
//          ""
//       )}
//    </main>
// );
// }
