"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function GSAPLoader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const squaresRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!gridRef.current || !loaderRef.current) return;

    const tl = gsap.timeline();
    const squares = squaresRef.current.filter(Boolean);

    // Initial State: Blue
    gsap.set(squares, { backgroundColor: "#0f68ff" });

    /**
     * 1. INITIAL STAY (Biru)
     * Menunggu sejenak sebelum mulai beraksi.
     */
    tl.to(gridRef.current, { opacity: 1, duration: 0.5 })
      .to({}, { duration: 0.6 });

    /**
     * 2. BIP BIP BIP BIP (4x Kedip Cepat - Biru)
     * Kedipan tajam dan singkat sesuai request.
     */
    tl.to(gridRef.current, { opacity: 0, duration: 0.05, repeat: 1, yoyo: true, ease: "none" })
      .to({}, { duration: 0.12 })
      .to(gridRef.current, { opacity: 0, duration: 0.05, repeat: 1, yoyo: true, ease: "none" })
      .to({}, { duration: 0.12 })
      .to(gridRef.current, { opacity: 0, duration: 0.05, repeat: 1, yoyo: true, ease: "none" })
      .to({}, { duration: 0.12 })
      .to(gridRef.current, { opacity: 0, duration: 0.05, repeat: 1, yoyo: true, ease: "none" });

    /**
     * 3. SECOND STAY (Biru Stabil)
     */
    tl.to(gridRef.current, { opacity: 1, duration: 0.1 })
      .to({}, { duration: 0.7 });

    /**
     * 4. BEEP BEEP BEEP (3x Kedip Lambat + Perubahan Warna ke Putih)
     * Irama melambat saat sistem "memulihkan" warna.
     */
    const step1 = [0, 1, 5, 6, 2, 10];
    const step2 = [11, 7, 3, 4, 8, 12, 16, 20, 21, 17, 13, 9, 14, 18, 22];
    const step3 = [15, 19, 23, 24];

    // Beeep 1
    tl.to(gridRef.current, { opacity: 0, duration: 0.2, repeat: 1, yoyo: true, ease: "sine.inOut" })
      .to(step1.map(i => squares[i]), { backgroundColor: "#ffffff", duration: 0.1 }, "-=0.3")
      .to({}, { duration: 0.2 })
      
      // Beeep 2
      .to(gridRef.current, { opacity: 0, duration: 0.2, repeat: 1, yoyo: true, ease: "sine.inOut" })
      .to(step2.map(i => squares[i]), { backgroundColor: "#ffffff", duration: 0.1 }, "-=0.3")
      .to({}, { duration: 0.2 })
      
      // Beeep 3
      .to(gridRef.current, { opacity: 0, duration: 0.2, repeat: 1, yoyo: true, ease: "sine.inOut" })
      .to(step3.map(i => squares[i]), { backgroundColor: "#ffffff", duration: 0.1 }, "-=0.3");

    /**
     * 5. THIRD STAY (Putih Stabil)
     * Hanya sebentar sebelum transisi keluar.
     */
    tl.to(gridRef.current, { 
      opacity: 1, 
      duration: 0.1, 
      onStart: () => { gsap.set(gridRef.current, { opacity: 1 }); } 
    })
    .to({}, { duration: 0.4 });

    /**
     * 6. FADE HILANG (Fade Out)
     */
    tl.to(gridRef.current, {
      opacity: 0,
      duration: 0.7,
      ease: "power2.inOut"
    })
    .to(loaderRef.current, {
      yPercent: -100,
      duration: 1.2,
      ease: "expo.inOut",
    }, "-=0.4");

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={loaderRef} className="fixed inset-0 z-[999] bg-bg flex items-center justify-center pointer-events-none">
      <div ref={gridRef} className="grid grid-cols-5 gap-px">
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