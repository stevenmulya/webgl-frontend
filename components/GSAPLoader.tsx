"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function GSAPLoader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.to(progressRef.current, {
      innerText: 100,
      duration: 1.5,
      snap: { innerText: 1 },
      ease: "power2.inOut",
    });
    tl.to(loaderRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: "expo.inOut",
    });
  }, []);

  return (
    <div ref={loaderRef} className="fixed inset-0 z-[999] bg-[#0f68ff] flex items-center justify-center">
      <h2 className="text-white text-5xl font-black font-mono">
        <span ref={progressRef}>0</span>%
      </h2>
    </div>
  );
}