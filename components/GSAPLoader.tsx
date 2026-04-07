"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function GSAPLoader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const squaresRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!gridRef.current || !loaderRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const squares = squaresRef.current.filter(Boolean);

      gsap.set(squares, { backgroundColor: "#0f68ff" });

      tl.to(gridRef.current, { opacity: 1, duration: 0.5 })
        .to({}, { duration: 0.6 })
        .to(gridRef.current, { opacity: 0, duration: 0.05, repeat: 1, yoyo: true, ease: "none" })
        .to({}, { duration: 0.12 })
        .to(gridRef.current, { opacity: 0, duration: 0.05, repeat: 1, yoyo: true, ease: "none" })
        .to(gridRef.current, { opacity: 1, duration: 0.1 })
        .to({}, { duration: 0.3 });

      const fillSequence = [
        0, 1, 5, 6, 2, 10,
        11, 7, 3, 4, 8, 12, 16, 20, 21, 17, 13, 9, 14, 18, 22,
        15, 19, 23, 24
      ];

      const progress = { value: 0 };
      
      tl.to(progress, {
        value: 100,
        duration: 2.5,
        ease: "power2.inOut",
        onUpdate: () => {
          const filledCount = Math.floor((progress.value / 100) * 25);

          for (let i = 0; i < filledCount; i++) {
            if (squares[fillSequence[i]]) {
              gsap.set(squares[fillSequence[i]], { backgroundColor: "#ffffff" });
            }
          }
        }
      });

      tl.to({}, { duration: 0.4 })
        .to(gridRef.current, { opacity: 0, duration: 0.7, ease: "power2.inOut" })
        .to(loaderRef.current, { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, "-=0.4")
        .set(loaderRef.current, { display: "none" });

    }, loaderRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={loaderRef} className="fixed inset-0 z-[999] bg-bg flex items-center justify-center pointer-events-none">
      <div ref={gridRef} className="grid grid-cols-5 gap-[2px]">
        {Array.from({ length: 25 }).map((_, i) => (
          <div 
            key={i} 
            ref={(el) => { squaresRef.current[i] = el; }}
            className="w-1 h-1" 
          />
        ))}
      </div>
    </div>
  );
}