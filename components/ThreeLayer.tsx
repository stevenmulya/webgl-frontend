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
        className="group relative h-2.75 overflow-hidden font-mono text-[11px] cursor-pointer outline-none block" 
        onMouseEnter={handleMouseEnter} 
        onClick={onClick}
      >
        <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-2.75">
          <span className={`h-2.75 leading-2.75 whitespace-nowrap block ${active ? "text-primary" : "text-fg/60"}`}>{label}</span>
          <span className={`h-2.75 leading-2.75 whitespace-nowrap block text-primary`}>{scrambled}</span>
        </div>
      </button>
    </div>
  );
}

function CRTMaterial({ url }: { url: string }) {
  const texture = useTexture(url);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTexture: { value: texture },
      uDotResolution: { value: 64.0 },
      uBrightness: { value: 1.8 },
      uColor: { value: new THREE.Color("#0f68ff") },
      uGlowIntensity: { value: 0.4 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1.0, 1.0) }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec4 vScreenPos;
      void main() {
        vUv = uv;
        vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vScreenPos = pos;
        gl_Position = pos;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec4 vScreenPos;
      uniform sampler2D uTexture;
      uniform float uDotResolution;
      uniform float uBrightness;
      uniform vec3 uColor;
      uniform float uGlowIntensity;
      uniform vec2 uMouse;
      uniform vec2 uResolution;

      void main() {
        vec2 screenUv = (vScreenPos.xy / vScreenPos.w) * 0.5 + 0.5;
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 dir = screenUv * aspect - uMouse * aspect;
        float mouseDist = length(dir);
        
        float intensity = smoothstep(0.4, 0.0, mouseDist);
        float easeIntensity = intensity * intensity * (3.0 - 2.0 * intensity);

        vec2 distortedUv = vUv - dir * easeIntensity * 0.2;

        vec2 grid = fract(distortedUv * uDotResolution);
        vec2 cell = floor(distortedUv * uDotResolution) / uDotResolution;
        vec3 texColor = texture2D(uTexture, cell).rgb;
        float distCRT = max(abs(grid.x - 0.5), abs(grid.y - 0.5));
        float dotMask = smoothstep(0.45, 0.35, distCRT);
        float scanline = sin(distortedUv.y * 400.0) * 0.08 + 0.92;
        vec3 baseColor = texColor * uBrightness;
        vec3 tVColor = mix(baseColor, uColor * baseColor, 0.5);
        vec3 glow = tVColor * uGlowIntensity;
        vec3 crtColor = (tVColor + glow) * dotMask * scanline;

        float htScale = 45.0;
        vec2 htCell = floor(distortedUv * htScale) / htScale;
        vec2 htFract = fract(distortedUv * htScale);
        
        vec3 htTexColor = texture2D(uTexture, htCell).rgb;
        float luminance = dot(htTexColor, vec3(0.299, 0.587, 0.114));
        vec3 invertedColor = 1.0 - htTexColor;
        float sqSize = clamp(luminance, 0.15, 0.85); 
        float isSquare = step(abs(htFract.x - 0.5), sqSize * 0.5) * step(abs(htFract.y - 0.5), sqSize * 0.5);
        vec3 effectColor = invertedColor * isSquare * 1.5;

        vec3 finalColor = mix(crtColor, effectColor, easeIntensity);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  }), [texture]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uMouse.value.set(
        state.mouse.x * 0.5 + 0.5,
        state.mouse.y * 0.5 + 0.5
      );
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return <shaderMaterial ref={materialRef} attach="material" args={[shaderArgs]} side={THREE.DoubleSide} />;
}

function TVCube({ 
  selectedIndex, 
  setSelectedIndex,
  activeTab
}: { 
  selectedIndex: number | null; 
  setSelectedIndex: Dispatch<SetStateAction<number | null>>;
  activeTab: string;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const frontDoorRef = useRef<THREE.Group>(null!);
  const topDoorRef = useRef<THREE.Group>(null!);
  const screenLightRef = useRef<THREE.PointLight>(null!);
  const { camera } = useThree();
  const images = ["/fallback001.png", "/fallback002.png", "/fallback003.png", "/fallback004.jpg", "/fallback005.jpg", "/fallback006.jpg"];
  const rotations = [[0, -Math.PI/2, 0], [0, Math.PI/2, 0], [Math.PI/2, 0, 0], [-Math.PI/2, 0, 0], [0, 0, 0], [0, Math.PI, 0]];

  const mouseTargetRotation = useRef(new THREE.Vector2(0, 0));
  const currentMouseRotation = useRef(new THREE.Vector2(0, 0));

  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const lastDragAmount = useRef(0);

  useEffect(() => {
    if (activeTab === "Work" && selectedIndex === null) {
      targetRotation.current.x = groupRef.current.rotation.x;
      targetRotation.current.y = groupRef.current.rotation.y;
    }
  }, [activeTab, selectedIndex]);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      isDragging.current = true;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      lastDragAmount.current = 0;
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (!isDragging.current || activeTab !== "Work" || selectedIndex !== null) return;
      
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      lastDragAmount.current += Math.abs(deltaX) + Math.abs(deltaY);
      
      targetRotation.current.y += deltaX * 0.005;
      targetRotation.current.x += deltaY * 0.005;
      
      dragStartPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [activeTab, selectedIndex]);

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
      setSelectedIndex(null);
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
    if (selectedIndex === null && activeTab === "Work") {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, 0.04);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, 0.04);
    } else if (activeTab === "Community") {
      groupRef.current.rotation.y += delta * 1.5;
      groupRef.current.rotation.x += delta * 1.2;
    } else if (activeTab === "About") {
      mouseTargetRotation.current.x = -state.mouse.y * 0.1;
      mouseTargetRotation.current.y = state.mouse.x * 0.1;

      currentMouseRotation.current.x = THREE.MathUtils.lerp(currentMouseRotation.current.x, mouseTargetRotation.current.x, 0.05);
      currentMouseRotation.current.y = THREE.MathUtils.lerp(currentMouseRotation.current.y, mouseTargetRotation.current.y, 0.05);

      groupRef.current.rotation.x = 0.35 + currentMouseRotation.current.x;
      groupRef.current.rotation.y = -0.45 + currentMouseRotation.current.y;
    } else {
      groupRef.current.rotation.y += delta * 0.1;
    }

    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 4.0) * 0.015;

    if (screenLightRef.current) {
      screenLightRef.current.intensity = 15 + Math.sin(state.clock.elapsedTime * 10) * 2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[1.1, 1.1, 1.1]} onClick={(e) => {
      e.stopPropagation();
      if (activeTab === "Work" && lastDragAmount.current < 5) {
        setSelectedIndex(Math.floor(e.object.userData.index / 2) || 0);
      }
    }}>
      <pointLight 
        ref={screenLightRef}
        color="#0f68ff" 
        intensity={15} 
        distance={5} 
        decay={2} 
        position={[0, 0, 0]} 
      />
      <mesh userData={{ index: 0 }} position={[0, 0, -1.9]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3.8, 3.8]} />
        <CRTMaterial url={images[5]} />
      </mesh>
      <mesh userData={{ index: 1 }} position={[0, -1.9, 0]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[3.8, 3.8]} />
        <CRTMaterial url={images[3]} />
      </mesh>
      <mesh userData={{ index: 2 }} position={[-1.9, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[3.8, 3.8]} />
        <CRTMaterial url={images[0]} />
      </mesh>
      <mesh userData={{ index: 3 }} position={[1.9, 0, 0]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[3.8, 3.8]} />
        <CRTMaterial url={images[1]} />
      </mesh>
      <group position={[0, 1.9, -1.9]} ref={topDoorRef}>
        <mesh userData={{ index: 4 }} position={[0, 0, 1.9]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[3.8, 3.8]} />
          <CRTMaterial url={images[2]} />
        </mesh>
      </group>
      <group position={[-1.9, 0, 1.9]} ref={frontDoorRef}>
        <mesh userData={{ index: 5 }} position={[1.9, 0, 0]}>
          <planeGeometry args={[3.8, 3.8]} />
          <CRTMaterial url={images[4]} />
        </mesh>
      </group>
    </group>
  );
}

const imagesToPreload = ["/fallback001.png", "/fallback002.png", "/fallback003.png", "/fallback004.jpg", "/fallback005.jpg", "/fallback006.jpg"];
imagesToPreload.forEach((url) => { useTexture.preload(url); });

const formatJakartaTime = (date: Date) => {
  const optionsTime: Intl.DateTimeFormatOptions = { 
    timeZone: "Asia/Jakarta", 
    hour12: false, 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit" 
  };
  const optionsDate: Intl.DateTimeFormatOptions = { 
    timeZone: "Asia/Jakarta", 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  };
  const time = new Intl.DateTimeFormat('id-ID', optionsTime).format(date);
  const dateStr = new Intl.DateTimeFormat('id-ID', optionsDate).format(date);
  return { time, date: dateStr };
};

export default function ThreeLayer({ 
  selectedGlobalIndex, 
  setSelectedGlobalIndex 
}: { 
  selectedGlobalIndex: number | null; 
  setSelectedGlobalIndex: Dispatch<SetStateAction<number | null>>;
}) {
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

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let hasMoved = false;

    const interval = setInterval(() => setCurrentTime(new Date()), 1000);

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
          if (dot) {
            gsap.set(dot, { x: pos.current[i].x, y: pos.current[i].y });
          }
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      gsap.ticker.add(updateTail);
      
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        gsap.ticker.remove(updateTail);
        clearInterval(interval);
      };
    });

    return () => ctx.revert();
  }, []);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const shareData = {
      title: 'Mulatama Studio',
      text: 'Check out this awesome website!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-10 w-screen h-screen bg-transparent overflow-hidden pointer-events-none flex items-center justify-center">
      
      <div className={`transition-opacity duration-700 ${activeTab === "About" ? 'opacity-0' : 'opacity-100'}`}>
        {Array.from({ length: numDots }).map((_, i) => (
          <div 
            key={i}
            ref={(el) => { dotsRef.current[i] = el; }}
            className="fixed top-0 left-0 w-2 h-2 bg-primary pointer-events-none z-999 -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
            style={{ opacity: 0, scale: 1 - i * 0.08 }}
          />
        ))}
      </div>

      <div className={`fixed top-10 right-10 z-50 text-right pointer-events-none transition-opacity duration-700 ${activeTab === "About" ? 'opacity-0' : 'opacity-100'}`}>
        <div className="font-mono text-[11px] text-white/80 mb-1 leading-none">
          {`Jakarta, Indonesia (GMT+7)`}
        </div>
        <div className="font-mono text-[11px] text-white leading-none min-h-2.75">
          {isMounted ? `${formatJakartaTime(currentTime).date} — ${formatJakartaTime(currentTime).time}` : ''}
        </div>
      </div>

      <div className={`fixed top-1/2 right-10 -translate-y-1/2 z-50 flex flex-col items-end pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${activeTab === "Work" && !isDetailActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
        <div className="font-mono text-[11px] text-fg/60 tracking-widest mb-5 uppercase">
          Recent Projects
        </div>
        <div className="flex flex-col gap-5 items-end text-right">
          
          <a href="/projects/gohte-architects" className="group flex flex-col items-end outline-none cursor-pointer">
            <span className="font-sans text-sm font-bold text-fg group-hover:text-primary transition-colors">Gohte Architects</span>
            <span className="font-mono text-[10px] text-fg/50 group-hover:text-primary/70 transition-colors">Architecture Firm</span>
          </a>
          
          <a href="/projects/daune" className="group flex flex-col items-end outline-none cursor-pointer">
            <span className="font-sans text-sm font-bold text-fg group-hover:text-primary transition-colors">Daune</span>
            <span className="font-mono text-[10px] text-fg/50 group-hover:text-primary/70 transition-colors">Body & Essential Oils</span>
          </a>
          
          <a href="/projects/hutama-maju-sukses" className="group flex flex-col items-end outline-none cursor-pointer">
            <span className="font-sans text-sm font-bold text-fg group-hover:text-primary transition-colors">Hutama Maju Sukses</span>
            <span className="font-mono text-[10px] text-fg/50 group-hover:text-primary/70 transition-colors">Steel Plates & Pipes</span>
          </a>

        </div>
      </div>

      <div className={`fixed bottom-10 right-10 z-50 flex items-center gap-5 pointer-events-auto transition-opacity duration-700 ${activeTab === "About" ? 'opacity-0' : 'opacity-100'}`}>
        <a href="#" className="text-white hover:text-primary transition-colors" aria-label="Twitter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.15H5.059z" />
          </svg>
        </a>
        <a href="#" className="text-white hover:text-primary transition-colors" aria-label="Facebook">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
          </svg>
        </a>
        <a href="#" className="text-white hover:text-primary transition-colors" aria-label="Instagram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.98a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        </a>
        <a href="#" className="text-white hover:text-primary transition-colors" aria-label="YouTube">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </a>
        <button onClick={handleShare} className="text-white hover:text-primary transition-colors cursor-pointer" aria-label="Share Link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
          </svg>
        </button>
      </div>

      <div className={`fixed bottom-10 left-10 z-50 pointer-events-none flex flex-col justify-end transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isDetailActive || activeTab === "About" ? 'opacity-0 -translate-x-10' : 'opacity-100 translate-x-0'}`}>
        <div className="flex gap-8 font-mono text-[11px] opacity-60 mb-6 pl-2">
          <div className="flex flex-col gap-1">
            <div className="leading-none">Website Developer</div>
            <div className="leading-none">open for projects</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="leading-none">stevenmulya@gmail.com</div>
            <div className="leading-none">+6287773298907</div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1 pl-2">
            <div className="w-1.5 h-1.5 bg-primary animate-rec" />
            <div className="font-mono text-[11px] text-fg opacity-60 tracking-widest leading-none">
              Mulatama Studio @2026
            </div>
          </div>
          <div className="relative -ml-2 transition-all duration-300 pointer-events-auto flex items-end">
            <h1 
              ref={mtsRef}
              className="font-sans font-black text-giant text-fg leading-[0.75] tracking-tighter mix-blend-difference cursor-default select-none opacity-0"
            >
              MTS
            </h1>
          </div>
        </div>
      </div>
      
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4 pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] delay-100 ${isDetailActive && activeTab === "Work" ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <h2 className="text-primary text-[11px] font-bold font-mono tracking-tighter drop-shadow-[0_0_15px_var(--color-primary)]">
          FALLBACK {labels[selectedGlobalIndex ?? 0]}
        </h2>
        <div className="flex items-center gap-6">
          <button onClick={prev} className="text-fg hover:text-primary transition-all duration-300 font-mono text-[11px] tracking-widest uppercase cursor-pointer">Prev</button>
          <button onClick={() => setSelectedGlobalIndex(null)} className="px-4 py-1.5 border border-primary text-primary hover:bg-primary hover:text-fg transition-all duration-300 font-mono text-[11px] tracking-widest uppercase cursor-pointer">Back to Orbit</button>
          <button onClick={next} className="text-fg hover:text-primary transition-all duration-300 font-mono text-[11px] tracking-widest uppercase cursor-pointer">Next</button>
        </div>
      </div>

      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isDetailActive ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <ScrambleLink 
          label="Work" 
          active={activeTab === "Work"} 
          onClick={() => { setActiveTab("Work"); setSelectedGlobalIndex(null); }} 
        />
        <span className="text-fg/60 font-mono text-[11px]">/</span>
        <ScrambleLink 
          label="About" 
          active={activeTab === "About"} 
          onClick={() => setActiveTab("About")} 
        />
        <span className="text-fg/60 font-mono text-[11px]">/</span>
        <ScrambleLink 
          label="Community" 
          active={activeTab === "Community"} 
          onClick={() => setActiveTab("Community")} 
        />
      </div>

      <Canvas 
        camera={{ position: [0, 0, 8.5] }} 
        style={{ pointerEvents: 'auto', position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh' }}
      >
        <ambientLight intensity={2.5} />
        <Suspense fallback={null}>
          <TVCube selectedIndex={selectedGlobalIndex} setSelectedIndex={setSelectedGlobalIndex} activeTab={activeTab} />
        </Suspense>
      </Canvas>
    </div>
  );
}