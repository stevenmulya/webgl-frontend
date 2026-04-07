"use client";
import { useState, useRef, useEffect } from "react";
import ThreeLayer from "@/components/ThreeLayer";
import P5Layer from "@/components/P5Layer";
import GSAPLoader from "@/components/GSAPLoader";

export default function Home() {
  const [globalIndex, setGlobalIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (globalIndex !== null) {
        videoRef.current.src = `/video00${globalIndex + 1}.mp4`;
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.removeAttribute("src");
        videoRef.current.load();
      }
    }
  }, [globalIndex]);

  return (
    <main id="main-container" className="relative w-full h-[100vh] bg-bg overflow-hidden">
      <div id="bg-color-layer" className="fixed inset-0 w-full h-screen z-0 bg-bg" />
      
      <GSAPLoader />
      
      <div id="video-layer" className="fixed inset-0 w-full h-screen z-0">
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            globalIndex !== null ? "opacity-40" : "opacity-0"
          }`}
        />
      </div>

      <div id="p5-layer" className="fixed inset-0 w-full h-screen z-10 pointer-events-none">
        <P5Layer activeGlobalIndex={globalIndex} />
      </div>
      
      <div className="fixed inset-0 w-full h-screen z-20 pointer-events-none">
        <ThreeLayer 
          selectedGlobalIndex={globalIndex} 
          setSelectedGlobalIndex={setGlobalIndex} 
        />
      </div>
    </main>
  );
}