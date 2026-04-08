"use client";

import { useState } from "react";

import ThreeLayer from "@/components/ThreeLayer";

import GSAPLoader from "@/components/GSAPLoader";



export default function Home() {

  const [isLoaderComplete, setIsLoaderComplete] = useState(false);

  const [globalIndex, setGlobalIndex] = useState<number | null>(null);



  return (

    <main className="relative w-full h-screen bg-bg overflow-hidden">

      <div className="fixed inset-0 w-full h-screen z-0 bg-bg" />

     

      {!isLoaderComplete && (

        <GSAPLoader onComplete={() => setIsLoaderComplete(true)} />

      )}

     

      <div className="fixed inset-0 w-full h-screen z-20">

        <ThreeLayer

          selectedGlobalIndex={globalIndex}

          setSelectedGlobalIndex={setGlobalIndex}

        />

      </div>

    </main>

  );

}

