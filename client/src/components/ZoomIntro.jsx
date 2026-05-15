import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const ZoomIntro = () => {
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const coverRef = useRef(null);
  const logoRef = useRef(null);
  const badgeRef = useRef(null);
  const progressRef = useRef(null);
  const flashRef = useRef(null);

  const navigate = useNavigate();

  const completeIntro = () => {
    localStorage.setItem("introShown", "true");
    navigate("/home");
  };

  useGSAP(
    () => {
      const tl = gsap.timeline({
        onComplete: completeIntro,
        defaults: { ease: "power3.out" },
      });

      // 1. Initial State Setup
      gsap.set(bgRef.current, { scale: 1.15, filter: "blur(4px)" });
      gsap.set(logoRef.current, { y: 30, opacity: 0, scale: 0.9 });
      gsap.set(badgeRef.current, { y: 20, opacity: 0 });
      gsap.set(progressRef.current, { scaleX: 0 });

      // 2. The Reveal (0s to 1s)
      tl.to(
        bgRef.current,
        {
          scale: 1,
          filter: "blur(0px)",
          duration: 2.5,
          ease: "power1.out",
        },
        0,
      )
        .to(
          logoRef.current,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
          },
          0.2,
        )
        .to(
          badgeRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 1,
          },
          0.4,
        )
        // The Light-Speed Progress Bar
        .to(
          progressRef.current,
          {
            scaleX: 1,
            duration: 2.5,
            ease: "power2.inOut",
          },
          0,
        );

      // 3. The "Warp Speed" Exit (2.5s to 3.2s)
      tl.to(
        logoRef.current,
        {
          y: -150,
          scale: 1.5,
          opacity: 0,
          duration: 0.6,
          ease: "power3.in",
        },
        2.5,
      )
        .to(
          badgeRef.current,
          {
            y: 100,
            opacity: 0,
            scale: 0.8,
            duration: 0.5,
            ease: "power3.in",
          },
          2.5,
        )
        .to(
          coverRef.current,
          {
            scale: 50, // Massive zoom through the "hole"
            duration: 1.2,
            ease: "expo.inOut",
          },
          2.4,
        )
        // The Seamless White Flash Transition
        .to(
          flashRef.current,
          {
            opacity: 1,
            duration: 0.3,
            ease: "power1.in",
          },
          2.8,
        );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] w-full h-screen overflow-hidden bg-[#020617] font-outfit"
    >
      {/* Top Progress Line */}
      <div
        ref={progressRef}
        className="absolute top-0 left-0 w-full h-1 bg-[#3d618c]  shadow-[0_0_15px_rgba(34,197,94,1)] z-50 origin-left"
      />

      {/* Parallax Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0 bg-cover bg-center opacity-50 will-change-transform"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')",
        }}
      />

      {/* Foreground Mask (The "Hole") */}
      <div
        ref={coverRef}
        className="absolute inset-0 z-10 pointer-events-none will-change-transform"
        style={{
          background: "radial-gradient(circle, transparent 5%, #020617 12%)",
        }}
      />

      {/* Main Content Layer */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
        {/* Logo */}
        <div ref={logoRef} className="will-change-transform">
          <h1 className="text-white text-6xl md:text-8xl font-black drop-shadow-2xl tracking-tighter">
            HORIZON
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#4A76AC]  to-[#3d618c] drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              shop
            </span>
          </h1>
        </div>

        {/* Premium Welcome Badge */}
        <div ref={badgeRef} className="mt-8 will-change-transform">
          <div className="relative group flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-3 rounded-full backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>

            <Sparkles size={16} className="text-[#3d618c] animate-pulse" />
            <p className="text-slate-200 text-sm md:text-base font-medium tracking-wide">
              Bienvenue chez horizon shop 
            </p>
          </div>
        </div>
      </div>

      {/* The White Flash Transition Layer */}
      <div
        ref={flashRef}
        className="absolute inset-0 bg-white z-40 opacity-0 pointer-events-none"
      />

      {/* Fallback Skip Button */}
      <button
        onClick={completeIntro}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 text-slate-500 hover:text-white text-[10px] font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer pb-1 border-b border-transparent hover:border-white"
      >
        Passer l'introduction
      </button>

      {/* Add Shimmer Animation to Tailwind locally if not in config */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ZoomIntro;
