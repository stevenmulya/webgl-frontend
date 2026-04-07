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
<<<<<<< HEAD
    <main id="main-container" className="relative w-full h-[100vh] bg-bg overflow-hidden">
=======
    <main id="main-container" className="relative w-full h-[400vh] bg-bg">
>>>>>>> 33c0494c29784461b974f2a693ab34d996ba3a85
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
<<<<<<< HEAD
=======

      <div 
        id="project-text-layer" 
        className={`fixed inset-0 z-30 w-full h-screen flex justify-between items-center px-6 md:px-12 transition-all duration-1000 pointer-events-none ${
          globalIndex !== null ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-[45%] md:w-1/4 flex flex-col gap-4 md:gap-6 pointer-events-auto">
          {currentCategory && (
            <h3 className="text-primary text-xxs md:text-xs font-mono tracking-[0.3em] uppercase mb-2">
              {currentCategory.title}
            </h3>
          )}
          {leftProjects.map((proj, idx) => {
            const id = `left-${idx}`;
            const isOpen = activeProject === id;
            return (
              <div key={id} className="text-left w-full">
                <button 
                  onClick={() => setActiveProject(isOpen ? null : id)}
                  className="text-left group cursor-pointer w-full focus:outline-none"
                >
                  <span className="text-fg/40 text-xxs font-mono block mb-1">00{idx + 1}</span>
                  <h4 className={`text-base md:text-xl font-bold font-sans tracking-tight transition-all duration-300 ${isOpen ? 'text-primary translate-x-2' : 'text-fg group-hover:text-primary group-hover:translate-x-2'}`}>
                    {proj.title}
                  </h4>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                  <p className="text-fg/70 text-xs md:text-sm font-mono leading-relaxed pl-2 border-l border-primary/50">
                    {proj.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-[45%] md:w-1/4 flex flex-col gap-4 md:gap-6 items-end text-right pointer-events-auto">
          {currentCategory && (
            <h3 className="text-transparent text-xxs md:text-xs font-mono tracking-[0.3em] uppercase mb-2 select-none">
              -
            </h3>
          )}
          {rightProjects.map((proj, idx) => {
            const id = `right-${idx}`;
            const isOpen = activeProject === id;
            return (
              <div key={id} className="text-right w-full flex flex-col items-end">
                <button 
                  onClick={() => setActiveProject(isOpen ? null : id)}
                  className="text-right group cursor-pointer w-full focus:outline-none"
                >
                  <span className="text-fg/40 text-xxs font-mono block mb-1">00{midPoint + idx + 1}</span>
                  <h4 className={`text-base md:text-xl font-bold font-sans tracking-tight transition-all duration-300 ${isOpen ? 'text-primary -translate-x-2' : 'text-fg group-hover:text-primary group-hover:-translate-x-2'}`}>
                    {proj.title}
                  </h4>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'} w-full`}>
                  <p className="text-fg/70 text-xs md:text-sm font-mono leading-relaxed pr-2 border-r border-primary/50">
                    {proj.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
>>>>>>> 33c0494c29784461b974f2a693ab34d996ba3a85
    </main>
  );
}