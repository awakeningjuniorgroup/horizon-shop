import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// 🟢 Directly importing the fevicon image
import fevicon from "../../src/assets/logo.png";


const PageLoader = () => {
  const location = useLocation();
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    // Trigger the loader every time the page route changes
    setIsRouting(true);

    // Hide the loader smoothly after 800ms
    const timer = setTimeout(() => {
      setIsRouting(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isRouting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[100000] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center m-0 w-full h-full"
          role="status"
          aria-live="polite"
        >
          {/* Glowing Logo Animation */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              filter: [
                "brightness(1) drop-shadow(0px 0px 0px rgba(16,185,129,0))",
                "brightness(1.15) drop-shadow(0px 15px 35px rgba(16,185,129,0.5))",
                "brightness(1) drop-shadow(0px 0px 0px rgba(16,185,129,0))",
              ],
            }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="relative flex items-center justify-center w-full mb-8"
          >
            {/* 🟢 Nudged 10px to the left using -translate-x-[10px] to fix image alignment */}
            <img
              src={fevicon}
              alt="Kuaku Market Chargement"
              className="w-32 md:w-44 h-auto object-contain block -translate-x-[10px]"
            />
          </motion.div>

          {/* Animated Loading Dots & Text - Perfectly Centered */}
          <div className="flex flex-col items-center justify-center w-full gap-4">
            <div className="flex items-center justify-center gap-2.5">
              <span
                className="w-2.5 h-2.5 bg-[#6FD3C1] rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="w-2.5 h-2.5 bg-[#6FD3C1] rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="w-2.5 h-2.5 bg-[#6FD3C1] rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></span>
            </div>
            <span className="text-emerald-700/70 text-[10px] font-black uppercase tracking-widest animate-pulse text-center block">
              Chargement
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
