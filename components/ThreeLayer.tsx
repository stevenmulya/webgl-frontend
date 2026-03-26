"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect, Dispatch, SetStateAction, Suspense } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function CRTMaterial({ url }: { url: string }) {
  const texture = useTexture(url);
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTexture: { value: texture },
      uDotResolution: { value: 64.0 },
      uBrightness: { value: 1.8 },
      uColor: { value: new THREE.Color("#0f68ff") },
      uGlowIntensity: { value: 0.4 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
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
        float dist = distance(grid, vec2(0.5));
        float dotMask = smoothstep(0.45, 0.35, dist);
        float scanline = sin(vUv.y * 400.0) * 0.08 + 0.92;
        vec3 baseColor = texColor * uBrightness;
        vec3 tVColor = mix(baseColor, uColor * baseColor, 0.5);
        vec3 glow = tVColor * uGlowIntensity;
        gl_FragColor = vec4((tVColor + glow) * dotMask * scanline, 1.0);
      }
    `
  }), [texture]);

  return <shaderMaterial attach="material" args={[shaderArgs]} side={THREE.DoubleSide} />;
}

function Stickman() {
  return (
    <group position={[0, -0.8, 0]}>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1.2]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.4, 1.0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.4, 1.0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 8]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
}

function TVCube({ 
  selectedIndex, 
  setSelectedIndex 
}: { 
  selectedIndex: number | null; 
  setSelectedIndex: Dispatch<SetStateAction<number | null>>;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const frontDoorRef = useRef<THREE.Group>(null!);
  const topDoorRef = useRef<THREE.Group>(null!);
  const screenLightRef = useRef<THREE.PointLight>(null!);
  const { camera } = useThree();
  const images = ["/fallback001.jpg", "/fallback002.jpg", "/fallback003.jpg", "/fallback004.jpg", "/fallback005.jpg", "/fallback006.jpg"];
  const rotations = [[0, -Math.PI/2, 0], [0, Math.PI/2, 0], [Math.PI/2, 0, 0], [-Math.PI/2, 0, 0], [0, 0, 0], [0, Math.PI, 0]];

  useEffect(() => {
    if (selectedIndex !== null) {
      gsap.to(groupRef.current.rotation, {
        x: rotations[selectedIndex][0],
        y: rotations[selectedIndex][1],
        z: rotations[selectedIndex][2],
        duration: 1.2,
        ease: "expo.out"
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#main-container",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        }
      });

      tl.to("#bg-color-layer", { backgroundColor: "#ffffff", duration: 1 }, 0)
        .to("#video-layer", { opacity: 0, duration: 0.5 }, 0)
        .to("#p5-layer", { opacity: 0, duration: 0.5 }, 0)
        .to(groupRef.current.rotation, { x: 0, y: 0, z: 0, duration: 1 }, 0)
        .to(frontDoorRef.current.rotation, { y: -Math.PI / 1.5, duration: 1.5 }, 0.5)
        .to(topDoorRef.current.rotation, { x: -Math.PI / 1.5, duration: 1.5 }, 0.5)
        .to(camera.position, { x: 0.8, y: -0.2, z: 4.5, duration: 2 }, 0.5)
        .to(camera.rotation, { x: 0, y: 0.15, z: 0, duration: 2 }, 0.5);
    });

    return () => ctx.revert();
  }, [camera]);

  useFrame((state, delta) => {
    if (selectedIndex === null && document.documentElement.scrollTop < 50) {
      groupRef.current.rotation.y += delta * 0.25;
      groupRef.current.rotation.x += delta * 0.12;
    }
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 4.0) * 0.015;

    if (screenLightRef.current) {
      screenLightRef.current.intensity = 15 + Math.sin(state.clock.elapsedTime * 10) * 2;
    }
  });

  return (
    <group ref={groupRef} onClick={(e) => {
      e.stopPropagation();
      if (document.documentElement.scrollTop < 50) {
        setSelectedIndex(Math.floor(e.object.userData.index / 2) || 0);
      }
    }}>
      <Stickman />
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

const imagesToPreload = [
  "/fallback001.jpg", 
  "/fallback002.jpg", 
  "/fallback003.jpg", 
  "/fallback004.jpg", 
  "/fallback005.jpg", 
  "/fallback006.jpg"
];

imagesToPreload.forEach((url) => {
  useTexture.preload(url);
});

export default function ThreeLayer({ 
  selectedGlobalIndex, 
  setSelectedGlobalIndex 
}: { 
  selectedGlobalIndex: number | null; 
  setSelectedGlobalIndex: Dispatch<SetStateAction<number | null>>;
}) {
  const labels = ["001", "002", "003", "004", "005", "006"];
  const next = () => setSelectedGlobalIndex((p) => (p === null || p >= 5 ? 0 : p + 1));
  const prev = () => setSelectedGlobalIndex((p) => (p === null || p <= 0 ? 5 : p - 1));

  return (
    <div className="absolute inset-0 z-10 w-full h-screen bg-transparent overflow-hidden pointer-events-none">
      <div className={`absolute inset-x-0 bottom-12 z-30 flex flex-col items-center gap-4 pointer-events-auto`}>
        <h2 className={`text-[#0f68ff] text-lg md:text-xl font-bold font-grotesk italic tracking-tighter drop-shadow-[0_0_15px_#0f68ff] transition-all duration-700 ease-out ${selectedGlobalIndex !== null ? 'translate-y-0 opacity-100 delay-300' : 'translate-y-8 opacity-0'}`}>
          FALLBACK {labels[selectedGlobalIndex ?? 0]}
        </h2>
        <div className="flex items-center gap-6">
          <button 
            onClick={prev} 
            className={`text-white hover:text-[#0f68ff] transition-all duration-700 ease-out font-grotesk text-[10px] md:text-xs tracking-widest uppercase cursor-pointer ${selectedGlobalIndex !== null ? 'translate-y-0 opacity-100 delay-500' : 'translate-y-8 opacity-0'}`}
          >
            Prev
          </button>
          <button 
            onClick={() => setSelectedGlobalIndex(null)} 
            className={`px-4 py-1.5 border border-[#0f68ff] text-[#0f68ff] hover:bg-[#0f68ff] hover:text-white transition-all duration-700 ease-out font-grotesk text-[10px] md:text-xs tracking-widest uppercase cursor-pointer ${selectedGlobalIndex !== null ? 'translate-y-0 opacity-100 delay-400' : 'translate-y-8 opacity-0'}`}
          >
            Back to Orbit
          </button>
          <button 
            onClick={next} 
            className={`text-white hover:text-[#0f68ff] transition-all duration-700 ease-out font-grotesk text-[10px] md:text-xs tracking-widest uppercase cursor-pointer ${selectedGlobalIndex !== null ? 'translate-y-0 opacity-100 delay-500' : 'translate-y-8 opacity-0'}`}
          >
            Next
          </button>
        </div>
      </div>
      <Canvas camera={{ position: [0, 0, 8.5] }} style={{ pointerEvents: 'auto' }}>
        <ambientLight intensity={2.5} />
        <Suspense fallback={null}>
          <TVCube selectedIndex={selectedGlobalIndex} setSelectedIndex={setSelectedGlobalIndex} />
        </Suspense>
      </Canvas>
    </div>
  );
}