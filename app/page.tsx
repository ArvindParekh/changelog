"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
   const [data, setData] = useState([]);

   useEffect(() => {
      const loadData = async () => {
         const fetchData = (await axios.get("http://localhost:3000/api")).data;
         setData(fetchData);
      };

      loadData();
   }, []);

   return (
      <main className='flex min-h-screen flex-col items-start p-5'>
         {data.toReversed().map((changelog, index) => {
            return (
               <div key={index} className='changelog-entry'>
                  <span className='text-yellow'>{changelog.date}:</span>{" "}
                  <span className='text-yellow-500'>{changelog.text}</span>
               </div>
            );
         })}
      </main>
   );
}
