import React, { useState, useEffect } from "react";

export default function InteractiveGrid() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isVisible) setIsVisible(true);
      setMouse({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isVisible]);

  // Subtle parallax translation
  const gridX = mouse.x * -0.015;
  const gridY = mouse.y * -0.015;

  // Mask limits highlight to cursor viewport coordinates
  const maskStyle = isVisible ? {
    WebkitMaskImage: `radial-gradient(180px circle at ${mouse.x}px ${mouse.y}px, black 0%, rgba(0,0,0,0.4) 45%, transparent 100%)`,
    maskImage: `radial-gradient(180px circle at ${mouse.x}px ${mouse.y}px, black 0%, rgba(0,0,0,0.4) 45%, transparent 100%)`,
  } : { opacity: 0 };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Sophisticated Multi-Layered Technical Grid System Stylesheet */}
      <style>{`
        @keyframes grid-scroll-fast {
          0% {
            background-position: 0px 0px, 0px 0px, 0px 0px, 0px 0px;
          }
          100% {
            background-position: -60px -60px, -60px -60px, -60px -60px, -60px -60px;
          }
        }
        
        .animate-grid-fast {
          animation: grid-scroll-fast 8s linear infinite;
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
        <div 
          className="absolute inset-0 animate-grid-fast grid-matrix-base transition-transform duration-1000 ease-out"
          style={{
            transform: `translate3d(${gridX}px, ${gridY}px, 0)`,
          }}
        />
      </div>
      
      {/* 2. Interactive Highlight Group (Masked dynamically in Viewport Space) */}
      <div 
        className="absolute inset-0 transition-opacity duration-500 z-10"
        style={maskStyle}
      >
        <div className="absolute inset-[-40%] transform rotate-[-25deg] scale-[1.2]">
          <div 
            className="absolute inset-0 animate-grid-fast grid-matrix-highlight transition-transform duration-1000 ease-out"
            style={{
              transform: `translate3d(${gridX}px, ${gridY}px, 0)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
