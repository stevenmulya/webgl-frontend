"use client";
import { useState, useRef, useEffect } from "react";
import ThreeLayer from "@/components/ThreeLayer";
import P5Layer from "@/components/P5Layer";
import GSAPLoader from "@/components/GSAPLoader";

const categoryData: Record<number, { title: string; projects: { title: string; desc: string }[] }> = {
  0: { 
    title: "Frontend Projects", 
    projects: [
      { title: "E-Commerce", desc: "Next.js shop with Stripe integration and cart state management." },
      { title: "Dashboard UI", desc: "React admin panel with Recharts and dark mode." },
      { title: "Landing Page", desc: "High-converting animated page with GSAP." },
      { title: "Portfolio V1", desc: "Previous minimalist developer portfolio." },
      { title: "Task Web App", desc: "PWA for daily task management and tracking." },
      { title: "SaaS Template", desc: "Landing page boilerplate for tech startups." },
      { title: "Blog Platform", desc: "MDX based blogging system with Next.js." },
      { title: "Interactive Map", desc: "Mapbox GL JS integration for real estate." }
    ] 
  },
  1: { 
    title: "Backend Systems", 
    projects: [
      { title: "API Gateway", desc: "Node.js gateway for routing microservices." },
      { title: "Auth Service", desc: "JWT based authentication with OAuth2." },
      { title: "Data Migration", desc: "PostgreSQL migration scripts and seeders." },
      { title: "Chat Server", desc: "WebSocket based real-time chat server." },
      { title: "Payment API", desc: "Wrapper for multiple payment gateways." },
      { title: "Video Transcoder", desc: "FFmpeg wrapper for video processing." },
      { title: "Cache Layer", desc: "Redis implementation for fast response." },
      { title: "Analytics Engine", desc: "Custom event tracking and aggregation." }
    ] 
  },
  2: { 
    title: "3D & Creative", 
    projects: [
      { title: "Three.js Scene", desc: "Interactive WebGL environment." },
      { title: "p5.js Particle", desc: "Audio-reactive particle system." },
      { title: "GLSL Shaders", desc: "Custom pixel shaders for post-processing." },
      { title: "WebXR App", desc: "VR experience running in the browser." },
      { title: "Physics Engine", desc: "Cannon-es integration with R3F." },
      { title: "Generative Art", desc: "Algorithmic canvas drawing." },
      { title: "ASCII Renderer", desc: "Real-time webcam to ASCII converter." },
      { title: "Fluid Sim", desc: "WebGL fluid dynamics simulation." }
    ] 
  },
  3: { 
    title: "UI/UX Design", 
    projects: [
      { title: "Fintech App", desc: "High-fidelity prototype for banking." },
      { title: "Web Redesign", desc: "UX overhaul for an e-commerce brand." },
      { title: "Design System", desc: "Figma component library and tokens." },
      { title: "Wireframes", desc: "Low-fi sketches for a healthcare app." },
      { title: "User Research", desc: "A/B testing and user interview data." },
      { title: "Icon Pack", desc: "Custom vector icons for UI." },
      { title: "Dark Mode UX", desc: "Color palette accessibility study." },
      { title: "Micro-interactions", desc: "Lottie animations for feedback." }
    ] 
  },
  4: { 
    title: "Open Source", 
    projects: [
      { title: "NPM Package", desc: "Utility functions for date parsing." },
      { title: "React Hook", desc: "useIntersectionObserver custom hook." },
      { title: "Tailwind Plugin", desc: "Custom gradients and shadows plugin." },
      { title: "CLI Tool", desc: "Terminal app for scaffolding React." },
      { title: "VS Code Theme", desc: "Dark theme optimized for contrast." },
      { title: "Docker Image", desc: "Optimized Node.js alpine container." },
      { title: "ESLint Config", desc: "Strict linting rules for Next.js." },
      { title: "Framer Motion Preset", desc: "Ready to use animation variants." }
    ] 
  },
  5: { 
    title: "Archived", 
    projects: [
      { title: "Old Portfolio", desc: "Vanilla HTML/CSS/JS website." },
      { title: "Client Work 2021", desc: "WordPress theme development." },
      { title: "School Project", desc: "Java based library management." },
      { title: "Hackathon", desc: "24-hour build: AI image generator." },
      { title: "Flash Game", desc: "ActionScript 3.0 nostalgic project." },
      { title: "Discord Bot", desc: "Music and moderation bot." },
      { title: "Python Scraper", desc: "Web scraping tool with BeautifulSoup." },
      { title: "C++ Calculator", desc: "Terminal based scientific calculator." }
    ] 
  },
};

export default function Home() {
  const [globalIndex, setGlobalIndex] = useState<number | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
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
    setActiveProject(null);
  }, [globalIndex]);

  const currentCategory = globalIndex !== null ? categoryData[globalIndex] : null;
  const projects = currentCategory?.projects || [];
  const midPoint = Math.ceil(projects.length / 2);
  const leftProjects = projects.slice(0, midPoint);
  const rightProjects = projects.slice(midPoint);

  return (
    <main id="main-container" className="relative w-full h-[400vh] bg-black">
      <div id="bg-color-layer" className="fixed inset-0 w-full h-screen z-0 bg-black" />
      
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

      <div 
        id="project-text-layer" 
        className={`fixed inset-0 z-30 w-full h-screen flex justify-between items-center px-6 md:px-12 transition-all duration-1000 pointer-events-none ${
          globalIndex !== null ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-[45%] md:w-1/4 flex flex-col gap-4 md:gap-6 pointer-events-auto">
          {currentCategory && (
            <h3 className="text-[#0f68ff] text-[10px] md:text-xs font-mono tracking-[0.3em] uppercase mb-2">
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
                  <span className="text-white/40 text-[10px] font-mono block mb-1">00{idx + 1}</span>
                  <h4 className={`text-base md:text-xl font-bold font-sans tracking-tight transition-all duration-300 ${isOpen ? 'text-[#0f68ff] translate-x-2' : 'text-white group-hover:text-[#0f68ff] group-hover:translate-x-2'}`}>
                    {proj.title}
                  </h4>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                  <p className="text-white/70 text-xs md:text-sm font-mono leading-relaxed pl-2 border-l border-[#0f68ff]/50">
                    {proj.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-[45%] md:w-1/4 flex flex-col gap-4 md:gap-6 items-end text-right pointer-events-auto">
          {currentCategory && (
            <h3 className="text-transparent text-[10px] md:text-xs font-mono tracking-[0.3em] uppercase mb-2 select-none">
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
                  <span className="text-white/40 text-[10px] font-mono block mb-1">00{midPoint + idx + 1}</span>
                  <h4 className={`text-base md:text-xl font-bold font-sans tracking-tight transition-all duration-300 ${isOpen ? 'text-[#0f68ff] -translate-x-2' : 'text-white group-hover:text-[#0f68ff] group-hover:-translate-x-2'}`}>
                    {proj.title}
                  </h4>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'} w-full`}>
                  <p className="text-white/70 text-xs md:text-sm font-mono leading-relaxed pr-2 border-r border-[#0f68ff]/50">
                    {proj.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}