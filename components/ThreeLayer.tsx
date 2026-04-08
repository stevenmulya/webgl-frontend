"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect, Dispatch, SetStateAction, Suspense, useState } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

function ScrambleLink({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [scrambled, setScrambled] = useState(label);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const chars = "!<>-_\\/[]{}—=+*^?#_";
    intervalRef.current = setInterval(() => {
      setScrambled(label.split("").map((letter, index) => {
        if (letter === " ") return " ";
        if (index < iteration) return label[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(""));
      if (iteration >= label.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      iteration += 1 / 3;
    }, 30);
  };

  return (
    <div className="relative flex flex-col items-center">
      <button 
        className="group relative h-[11px] overflow-hidden font-mono text-[11px] cursor-pointer outline-none block" 
        onMouseEnter={handleMouseEnter} 
        onClick={onClick}
      >
        <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-[11px]">
          <span className={`h-[11px] leading-[11px] whitespace-nowrap block ${active ? "text-primary" : "text-fg/60"}`}>{label}</span>
          <span className={`h-[11px] leading-[11px] whitespace-nowrap block text-primary`}>{scrambled}</span>
        </div>
      </button>
    </div>
  );
}

function CRTMaterial({ url }: { url: string }) {
  const texture = useTexture(url);
  
  useEffect(() => {
    if (texture) {
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.needsUpdate = true;
    }
  }, [texture]);

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uDotResolution: { value: 64.0 },
    uBrightness: { value: 1.8 },
    uColor: { value: new THREE.Color("#0f68ff") },
    uGlowIntensity: { value: 0.4 }
  }), [texture]);

  return (
    <shaderMaterial
      key={url}
      attach="material"
      uniforms={uniforms}
      vertexShader={`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform float uDotResolution;
        uniform float uBrightness;
        uniform vec3 uColor;
        uniform float uGlowIntensity;
        void main() {
          vec2 grid = fract(vUv * uDotResolution);
          vec2 cell = floor(vUv * uDotResolution) / uDotResolution;
          vec3 texColor = texture2D(uTexture, cell).rgb;
          float dist = max(abs(grid.x - 0.5), abs(grid.y - 0.5));
          float dotMask = smoothstep(0.45, 0.35, dist);
          float scanline = sin(vUv.y * 400.0) * 0.08 + 0.92;
          vec3 baseColor = texColor * uBrightness;
          vec3 tVColor = mix(baseColor, uColor * baseColor, 0.5);
          vec3 glow = tVColor * uGlowIntensity;
          gl_FragColor = vec4((tVColor + glow) * dotMask * scanline, 1.0);
        }
      `}
      side={THREE.DoubleSide}
    />
  );
}

function TVCube({ selectedIndex, activeTab }: { selectedIndex: number | null; activeTab: string; }) {
  const groupRef = useRef<THREE.Group>(null!);
  const frontDoorRef = useRef<THREE.Group>(null!);
  const topDoorRef = useRef<THREE.Group>(null!);
  const screenLightRef = useRef<THREE.PointLight>(null!);
  const { camera, gl } = useThree();
  const images = ["/fallback001.jpg", "/fallback002.jpg", "/fallback003.jpg", "/fallback004.jpg", "/fallback005.jpg", "/fallback006.jpg"];
  const rotations = [[0, -Math.PI/2, 0], [0, Math.PI/2, 0], [Math.PI/2, 0, 0], [-Math.PI/2, 0, 0], [0, 0, 0], [0, Math.PI, 0]];
  const mouseTargetRotation = useRef(new THREE.Vector2(0, 0));
  const currentMouseRotation = useRef(new THREE.Vector2(0, 0));
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (activeTab === "Work" && selectedIndex === null) {
      targetRotation.current.x = groupRef.current.rotation.x;
      targetRotation.current.y = groupRef.current.rotation.y;
    }
  }, [activeTab, selectedIndex]);

  useEffect(() => {
    const domElement = gl.domElement;
    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current || activeTab !== "Work" || selectedIndex !== null) return;
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      targetRotation.current.y += deltaX * 0.005;
      targetRotation.current.x += deltaY * 0.005;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
    };
    const handlePointerUp = () => { isDragging.current = false; };
    domElement.addEventListener("pointerdown", handlePointerDown);
    domElement.addEventListener("pointermove", handlePointerMove);
    domElement.addEventListener("pointerup", handlePointerUp);
    domElement.addEventListener("pointerleave", handlePointerUp);
    return () => {
      domElement.removeEventListener("pointerdown", handlePointerDown);
      domElement.removeEventListener("pointermove", handlePointerMove);
      domElement.removeEventListener("pointerup", handlePointerUp);
      domElement.removeEventListener("pointerleave", handlePointerUp);
    };
  }, [activeTab, selectedIndex, gl]);

  useEffect(() => {
    if (activeTab === "About") {
      gsap.to(groupRef.current.rotation, { x: 0.35, y: -0.45, z: 0.1, duration: 1.5, ease: "expo.inOut" });
      gsap.to(frontDoorRef.current.rotation, { y: 0, duration: 1.5, ease: "expo.inOut" });
      gsap.to(topDoorRef.current.rotation, { x: 0, duration: 1.5, ease: "expo.inOut" });
      gsap.to(camera.position, { x: 0, y: 0, z: 18.0, duration: 2, ease: "expo.inOut" });
    } else if (activeTab === "Community") {
      gsap.to(frontDoorRef.current.rotation, { y: 0, duration: 1.5, ease: "expo.inOut" });
      gsap.to(topDoorRef.current.rotation, { x: 0, duration: 1.5, ease: "expo.inOut" });
      gsap.to(camera.position, { x: 0, y: 0, z: 15, duration: 2, ease: "expo.inOut" });
    } else {
      gsap.to(frontDoorRef.current.rotation, { y: 0, duration: 1.5, ease: "expo.inOut" });
      gsap.to(topDoorRef.current.rotation, { x: 0, duration: 1.5, ease: "expo.inOut" });
      gsap.to(camera.position, { x: 0, y: 0, z: 8.5, duration: 2, ease: "expo.inOut" });
      if (selectedIndex !== null) {
        gsap.to(groupRef.current.rotation, {
          x: rotations[selectedIndex][0],
          y: rotations[selectedIndex][1],
          z: rotations[selectedIndex][2],
          duration: 1.2,
          ease: "expo.out"
        });
      }
    }
  }, [activeTab, selectedIndex, camera]);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.1);
    if (selectedIndex === null && activeTab === "Work") {
      if (!isDragging.current) {
        targetRotation.current.y += safeDelta * 0.2;
        targetRotation.current.x = THREE.MathUtils.lerp(targetRotation.current.x, 0, 0.02);
      }
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, 0.04);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, 0.04);
    } else if (activeTab === "Community") {
      groupRef.current.rotation.y += safeDelta * 1.5;
      groupRef.current.rotation.x += safeDelta * 1.2;
    } else if (activeTab === "About") {
      mouseTargetRotation.current.x = -state.mouse.y * 0.1;
      mouseTargetRotation.current.y = state.mouse.x * 0.1;
      currentMouseRotation.current.x = THREE.MathUtils.lerp(currentMouseRotation.current.x, mouseTargetRotation.current.x, 0.05);
      currentMouseRotation.current.y = THREE.MathUtils.lerp(currentMouseRotation.current.y, mouseTargetRotation.current.y, 0.05);
      groupRef.current.rotation.x = 0.35 + currentMouseRotation.current.x;
      groupRef.current.rotation.y = -0.45 + currentMouseRotation.current.y;
    }
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 4.0) * 0.015;
    if (screenLightRef.current) {
      screenLightRef.current.intensity = 15 + Math.sin(state.clock.elapsedTime * 10) * 2;
    }
  });

  return (
    <group ref={groupRef} scale={[1.45, 1.45, 1.45]}>
      <pointLight ref={screenLightRef} color="#0f68ff" intensity={15} distance={5} decay={2} position={[0, 0, 0]} />
      <mesh position={[0, 0, -1.9]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3.8, 3.8]} />
        <CRTMaterial url={images[5]} />
      </mesh>
      <mesh position={[0, -1.9, 0]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[3.8, 3.8]} />
        <CRTMaterial url={images[3]} />
      </mesh>
      <mesh position={[-1.9, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[3.8, 3.8]} />
        <CRTMaterial url={images[0]} />
      </mesh>
      <mesh position={[1.9, 0, 0]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[3.8, 3.8]} />
        <CRTMaterial url={images[1]} />
      </mesh>
      <group position={[0, 1.9, -1.9]} ref={topDoorRef}>
        <mesh position={[0, 0, 1.9]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[3.8, 3.8]} />
          <CRTMaterial url={images[2]} />
        </mesh>
      </group>
      <group position={[-1.9, 0, 1.9]} ref={frontDoorRef}>
        <mesh position={[1.9, 0, 0]}>
          <planeGeometry args={[3.8, 3.8]} />
          <CRTMaterial url={images[4]} />
        </mesh>
      </group>
    </group>
  );
}

const imagesToPreload = ["/fallback001.jpg", "/fallback002.jpg", "/fallback003.jpg", "/fallback004.jpg", "/fallback005.jpg", "/fallback006.jpg"];
imagesToPreload.forEach((url) => { useTexture.preload(url); });

export default function ThreeLayer({ selectedGlobalIndex, setSelectedGlobalIndex }: { selectedGlobalIndex: number | null; setSelectedGlobalIndex: Dispatch<SetStateAction<number | null>>; }) {
  const [activeTab, setActiveTab] = useState<string>("Work");
  const mtsRef = useRef<HTMLHeadingElement>(null);
  const numDots = 10;
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef(Array.from({ length: numDots }, () => ({ x: 0, y: 0 })));
  const labels = ["001", "002", "003", "004", "005", "006"];
  const next = () => setSelectedGlobalIndex((p) => (p === null || p >= 5 ? 0 : p + 1));
  const prev = () => setSelectedGlobalIndex((p) => (p === null || p <= 0 ? 5 : p - 1));
  const isDetailActive = selectedGlobalIndex !== null;

  useEffect(() => {
    let hasMoved = false;
    const ctx = gsap.context(() => {
      if (mtsRef.current) {
        const tlMts = gsap.timeline({ delay: 1.5 });
        tlMts.set(mtsRef.current, { opacity: 0 })
          .to(mtsRef.current, { opacity: 1, duration: 0.05, repeat: 1, yoyo: true, ease: "none" })
          .to({}, { duration: 0.12 })
          .to(mtsRef.current, { opacity: 1, duration: 0.05, repeat: 1, yoyo: true, ease: "none" })
          .to({}, { duration: 0.12 })
          .to(mtsRef.current, { opacity: 1, duration: 0.05, repeat: 1, yoyo: true, ease: "none" })
          .to({}, { duration: 0.12 })
          .to(mtsRef.current, { opacity: 1, duration: 0.05, repeat: 1, yoyo: true, ease: "none" })
          .to(mtsRef.current, { opacity: 1, duration: 0.1 });
      }
      const handleMouseMove = (e: MouseEvent) => {
        mouse.current.x = e.clientX;
        mouse.current.y = e.clientY;
        if (!hasMoved) {
          hasMoved = true;
          pos.current.forEach(p => { p.x = e.clientX; p.y = e.clientY; });
          gsap.to(dotsRef.current, { opacity: 1, duration: 0.3, stagger: 0.05 });
        }
      };
      const updateTail = () => {
        if (!hasMoved) return;
        pos.current[0].x += (mouse.current.x - pos.current[0].x) * 0.15;
        pos.current[0].y += (mouse.current.y - pos.current[0].y) * 0.15;
        for (let i = 1; i < numDots; i++) {
          pos.current[i].x += (pos.current[i - 1].x - pos.current[i].x) * 0.35;
          pos.current[i].y += (pos.current[i - 1].y - pos.current[i].y) * 0.35;
        }
        dotsRef.current.forEach((dot, i) => {
          if (dot) gsap.set(dot, { x: pos.current[i].x, y: pos.current[i].y });
        });
      };
      window.addEventListener("mousemove", handleMouseMove);
      gsap.ticker.add(updateTail);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        gsap.ticker.remove(updateTail);
      };
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="fixed inset-0 z-10 w-screen h-screen bg-transparent overflow-hidden pointer-events-none flex items-center justify-center">
      <div className="fixed inset-0 z-[9999] pointer-events-none grid grid-cols-10 grid-rows-10 opacity-30">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="border border-fg/20 flex items-center justify-center">
            <span className="text-fg/50 text-[10px] font-mono">{i + 1}</span>
          </div>
        ))}
      </div>
      <div className={`transition-opacity duration-700 ${activeTab === "About" ? 'opacity-0' : 'opacity-100'}`}>
        {Array.from({ length: numDots }).map((_, i) => (
          <div key={i} ref={(el) => { dotsRef.current[i] = el; }} className="fixed top-0 left-0 w-2 h-2 bg-primary pointer-events-none z-[999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference" style={{ opacity: 0, scale: 1 - i * 0.08 }} />
        ))}
      </div>
      <div className={`fixed bottom-10 left-10 z-50 pointer-events-none flex flex-col justify-end transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isDetailActive || activeTab === "About" ? 'opacity-0 -translate-x-10' : 'opacity-100 translate-x-0'}`}>
        <div className="flex gap-8 font-mono text-[11px] opacity-60 mb-6 pl-2">
          <div className="flex flex-col gap-1">
            <div className="leading-none">Website Developer</div>
            <div className="leading-none">Jakarta, Indonesia</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="leading-none">stevenmulya@gmail.com</div>
            <div className="leading-none">+6287773298907</div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1 pl-2">
            <div className="w-1.5 h-1.5 bg-primary animate-rec" />
            <div className="font-mono text-[11px] text-fg opacity-60 tracking-widest leading-none">Mulatama Studio @2026</div>
          </div>
          <div className="relative -ml-2 transition-all duration-300 pointer-events-auto flex items-end">
            <h1 ref={mtsRef} className="font-sans font-black text-giant text-fg leading-[0.75] tracking-tighter mix-blend-difference cursor-default select-none opacity-0">MTS</h1>
          </div>
        </div>
      </div>
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4 pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] delay-100 ${isDetailActive && activeTab === "Work" ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <h2 className="text-primary text-[11px] font-bold font-mono tracking-tighter drop-shadow-[0_0_15px_var(--color-primary)]">INDEX {labels[selectedGlobalIndex ?? 0]}</h2>
        <div className="flex items-center gap-6">
          <button onClick={prev} className="text-fg hover:text-primary transition-all duration-300 font-mono text-[11px] tracking-widest uppercase cursor-pointer">Prev</button>
          <button onClick={() => setSelectedGlobalIndex(null)} className="px-4 py-1.5 border border-primary text-primary hover:bg-primary hover:text-fg transition-all duration-300 font-mono text-[11px] tracking-widest uppercase cursor-pointer">Back to Orbit</button>
          <button onClick={next} className="text-fg hover:text-primary transition-all duration-300 font-mono text-[11px] tracking-widest uppercase cursor-pointer">Next</button>
        </div>
      </div>
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isDetailActive ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <ScrambleLink label="Work" active={activeTab === "Work"} onClick={() => { setActiveTab("Work"); setSelectedGlobalIndex(null); }} />
        <span className="text-fg/60 font-mono text-[11px]">/</span>
        <ScrambleLink label="About" active={activeTab === "About"} onClick={() => setActiveTab("About")} />
        <span className="text-fg/60 font-mono text-[11px]">/</span>
        <ScrambleLink label="Community" active={activeTab === "Community"} onClick={() => setActiveTab("Community")} />
      </div>
      <Canvas camera={{ position: [0, 0, 8.5] }} style={{ pointerEvents: 'auto', position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh' }}>
        <ambientLight intensity={2.5} />
        <Suspense fallback={null}>
          <TVCube selectedIndex={selectedGlobalIndex} activeTab={activeTab} />
        </Suspense>
      </Canvas>
    </div>
  );
}