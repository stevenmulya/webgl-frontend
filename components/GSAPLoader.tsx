"use client";

import { useEffect, useRef } from "react";

import gsap from "gsap";



export default function GSAPLoader({ onComplete }: { onComplete: () => void }) {

  const loaderRef = useRef<HTMLDivElement>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const squaresRef = useRef<(HTMLDivElement | null)[]>([]);

  const bgPanelsRef = useRef<(HTMLDivElement | null)[]>([]);



  useEffect(() => {

    if (!gridRef.current || !loaderRef.current) return;



    const tl = gsap.timeline();

    const squares = squaresRef.current.filter(Boolean);

    const bgPanels = bgPanelsRef.current.filter(Boolean);



    gsap.set(squares, { backgroundColor: "#0f68ff" });



    tl.to(gridRef.current, { opacity: 1, duration: 0.5 })

      .to({}, { duration: 0.6 });



    tl.to(gridRef.current, { opacity: 0, duration: 0.05, repeat: 1, yoyo: true, ease: "none" })

      .to({}, { duration: 0.12 })

      .to(gridRef.current, { opacity: 0, duration: 0.05, repeat: 1, yoyo: true, ease: "none" })

      .to({}, { duration: 0.12 })

      .to(gridRef.current, { opacity: 0, duration: 0.05, repeat: 1, yoyo: true, ease: "none" })

      .to({}, { duration: 0.12 })

      .to(gridRef.current, { opacity: 0, duration: 0.05, repeat: 1, yoyo: true, ease: "none" });



    tl.to(gridRef.current, { opacity: 1, duration: 0.1 })

      .to({}, { duration: 0.7 });



    const step1 = [0, 1, 5, 6, 2, 10];

    const step2 = [11, 7, 3, 4, 8, 12, 16, 20, 21, 17, 13, 9, 14, 18, 22];

    const step3 = [15, 19, 23, 24];



    tl.to(gridRef.current, { opacity: 0, duration: 0.2, repeat: 1, yoyo: true, ease: "sine.inOut" })

      .to(step1.map(i => squares[i]), { backgroundColor: "#f7f1df", duration: 0.1 }, "-=0.3")

      .to({}, { duration: 0.2 })

      .to(gridRef.current, { opacity: 0, duration: 0.2, repeat: 1, yoyo: true, ease: "sine.inOut" })

      .to(step2.map(i => squares[i]), { backgroundColor: "#f7f1df", duration: 0.1 }, "-=0.3")

      .to({}, { duration: 0.2 })

      .to(gridRef.current, { opacity: 0, duration: 0.2, repeat: 1, yoyo: true, ease: "sine.inOut" })

      .to(step3.map(i => squares[i]), { backgroundColor: "#f7f1df", duration: 0.1 }, "-=0.3");



    tl.to(gridRef.current, {

      opacity: 1,

      duration: 0.1,

      onStart: () => { gsap.set(gridRef.current, { opacity: 1 }); }

    })

    .to({}, { duration: 0.4 });



    tl.to(squares, {

      scale: 0,

      opacity: 0,

      duration: 0.4,

      stagger: {

        grid: [5, 5],

        from: "end",

        axis: "y",

        amount: 0.4

      },

      ease: "back.in(2)"

    });



    tl.to(bgPanels, {

      scale: 0,

      opacity: 0,

      duration: 0.8,

      stagger: {

        grid: [40, 40],

        from: "end",

        axis: "y",

        amount: 0.6

      },

      ease: "power3.inOut",

      onComplete: onComplete

    }, "-=0.2");



    return () => {

      tl.kill();

    };

  }, [onComplete]);



  return (

    <div ref={loaderRef} className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none w-screen h-screen">

      <div

        className="absolute inset-0 grid w-full h-full z-0"

        style={{ gridTemplateColumns: 'repeat(40, minmax(0, 1fr))', gridTemplateRows: 'repeat(40, minmax(0, 1fr))' }}

      >

        {Array.from({ length: 1600 }).map((_, i) => (

          <div

            key={`bg-${i}`}

            ref={(el) => { bgPanelsRef.current[i] = el; }}

            className="bg-[#050505] w-full h-full origin-bottom"

          />

        ))}

      </div>

      <div ref={gridRef} className="relative z-10 grid grid-cols-5 gap-px">

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

