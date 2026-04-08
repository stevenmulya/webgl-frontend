"use client";

import { useState } from "react";
import ThreeLayer from "@/components/ThreeLayer";
import GSAPLoader from "@/components/GSAPLoader";
import SmoothScroll from "@/components/SmoothScroll";

export default function Home() {
  const [isLoaderComplete, setIsLoaderComplete] = useState(false);
  const [globalIndex, setGlobalIndex] = useState<number | null>(null);

  const projects = [
    { title: "Gohte Architect", location: "Indonesia", desc: "Arsitek Jasa", url: "https://www.andrewgohte.com/" },
    { title: "Daune", location: "Malaysia", desc: "Body Oil Essential Oil", url: "https://daune.my/" },
    { title: "PT Hutama Maju Sukses", location: "Indonesia", desc: "Distributor Pipa Besi Plat", url: "https://www.hutamamajusukses.com/" },
    { title: "Assurenex Trustee", location: "Malaysia", desc: "Konsultan Bisnis", url: "https://www.assurenextrustee.com/" },
    { title: "Damastudio", location: "Indonesia", desc: "Fashion Consultant", url: "https://www.damastudio.id/" }
  ];

  return (
    <SmoothScroll>
      <main className="relative w-full bg-bg text-fg overflow-x-hidden">
        <div className="fixed inset-0 w-full h-screen z-0 bg-bg pointer-events-none" />
        
        {!isLoaderComplete && (
          <GSAPLoader onComplete={() => setIsLoaderComplete(true)} />
        )}
        
        <div className="fixed inset-0 w-full h-screen z-10 pointer-events-none">
          <ThreeLayer
            selectedGlobalIndex={globalIndex}
            setSelectedGlobalIndex={setGlobalIndex}
          />
        </div>

        <div className="relative z-20 w-full flex flex-col pointer-events-none">
          <div className="w-full h-screen shrink-0 pointer-events-none" />
          
          <section className="w-full min-h-screen bg-bg z-30 pointer-events-auto flex flex-col items-center py-20 md:py-32 px-4 sm:px-8 md:px-16 border-t border-fg/10 relative">
            <div className="w-full max-w-7xl">
              <div className="flex items-center gap-4 mb-10 md:mb-16">
                <div className="w-2 h-2 bg-primary animate-rec" />
                <h2 className="text-primary text-[11px] font-mono tracking-widest uppercase font-bold drop-shadow-[0_0_15px_var(--color-primary)]">
                  Featured Projects
                </h2>
              </div>
              
              <div className="flex flex-col w-full border-t border-fg/20">
                {projects.map((proj, i) => (
                  <a 
                    key={i} 
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group cursor-pointer border-b border-fg/20 py-8 md:py-12 flex flex-col md:flex-row md:items-center justify-between hover:bg-fg hover:px-4 md:hover:px-8 transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] overflow-hidden relative gap-6 md:gap-0"
                  >
                    <div className="flex flex-col z-10">
                      <h3 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-black text-fg/30 group-hover:text-bg transition-colors duration-700 uppercase tracking-tighter leading-none">
                        {proj.title}
                      </h3>
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto z-10 md:mt-0 pt-2 md:pt-0">
                      <div className="flex flex-col md:text-right">
                        <span className="text-fg/60 group-hover:text-bg/60 transition-colors duration-700 font-mono text-[10px] md:text-[11px] uppercase tracking-widest">
                          {proj.location}
                        </span>
                        <span className="text-fg/40 group-hover:text-bg/40 transition-colors duration-700 font-mono text-[10px] md:text-[11px] uppercase tracking-widest">
                          {proj.desc}
                        </span>
                      </div>
                      <span className="text-primary font-mono text-[10px] md:text-[11px] group-hover:text-primary transition-colors duration-700 md:mt-4">
                        00{i + 1}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </SmoothScroll>
  );
}