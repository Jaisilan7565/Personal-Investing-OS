import React, { useEffect, useRef } from "react";

export default function InteractiveGrid() {
  const baseGridRef = useRef(null);
  const highlightGridRef = useRef(null);
  const highlightWrapperRef = useRef(null);
  
  useEffect(() => {
    let frameId;
    
    const handleMouseMove = (e) => {
      if (frameId) cancelAnimationFrame(frameId);
      
      frameId = requestAnimationFrame(() => {
        const x = e.clientX;
        const y = e.clientY;
        const parallaxX = x * -0.015;
        const parallaxY = y * -0.015;

        if (baseGridRef.current) {
          baseGridRef.current.style.transform = `translate3d(${parallaxX}px, ${parallaxY}px, 0)`;
        }
        
        if (highlightGridRef.current) {
          highlightGridRef.current.style.transform = `translate3d(${parallaxX}px, ${parallaxY}px, 0)`;
        }
        
        if (highlightWrapperRef.current) {
          const maskStr = `radial-gradient(180px circle at ${x}px ${y}px, black 0%, rgba(0,0,0,0.4) 45%, transparent 100%)`;
          highlightWrapperRef.current.style.WebkitMaskImage = maskStr;
          highlightWrapperRef.current.style.maskImage = maskStr;
          highlightWrapperRef.current.style.opacity = '1';
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Sophisticated Multi-Layered Technical Grid System Stylesheet */}
      <style>{`
        @keyframes grid-scroll-fast {
          0% {
            transform: translate3d(0px, 0px, 0);
          }
          100% {
            transform: translate3d(-60px, -60px, 0);
          }
        }
        
        .animate-grid-fast {
          animation: grid-scroll-fast 8s linear infinite;
          will-change: transform;
        }

        /* Core definitions for layered major/minor blueprint matrices */
        .grid-matrix-base {
          background-image: 
            linear-gradient(to right, rgba(99,102,241,0.32) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99,102,241,0.32) 1px, transparent 1px),
            linear-gradient(to right, rgba(99,102,241,0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99,102,241,0.12) 1px, transparent 1px);
          background-size: 30px 30px, 30px 30px, 10px 10px, 10px 10px;
        }
        
        .dark .grid-matrix-base {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px),
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
        }
        
        .grid-matrix-highlight {
          background-image: 
            linear-gradient(to right, rgba(99,102,241,0.85) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99,102,241,0.85) 1px, transparent 1px),
            linear-gradient(to right, rgba(99,102,241,0.32) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99,102,241,0.32) 1px, transparent 1px);
          background-size: 30px 30px, 30px 30px, 10px 10px, 10px 10px;
        }
        
        .dark .grid-matrix-highlight {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.40) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.40) 1px, transparent 1px),
            linear-gradient(to right, rgba(255,255,255,0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.14) 1px, transparent 1px);
        }
      `}</style>

      {/* 1. Base Grid Group (Rotated, Dual-Layer Blueprint Grid, Continuous Flow) */}
      <div className="absolute inset-[-40%] transform rotate-[-25deg] scale-[1.2]">
        <div ref={baseGridRef} className="absolute inset-0 transition-transform duration-100 ease-out will-change-transform">
          <div className="absolute inset-[-100px] animate-grid-fast grid-matrix-base" />
        </div>
      </div>
      
      {/* 2. Interactive Highlight Group (Masked dynamically in Viewport Space) */}
      <div 
        ref={highlightWrapperRef}
        className="absolute inset-0 transition-opacity duration-500 z-10 opacity-0 will-change-[mask-image]"
      >
        <div className="absolute inset-[-40%] transform rotate-[-25deg] scale-[1.2]">
          <div ref={highlightGridRef} className="absolute inset-0 transition-transform duration-100 ease-out will-change-transform">
            <div className="absolute inset-[-100px] animate-grid-fast grid-matrix-highlight" />
          </div>
        </div>
      </div>
    </div>
  );
}
