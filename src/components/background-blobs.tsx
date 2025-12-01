"use client";

// Optimized: Import only what we need from framer-motion
import { motion, type MotionProps } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function BackgroundBlobs() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) return null;

  const isDark = theme === "dark";

  // Enhanced blob configurations with HIGH intensity movement and ultra-smooth animations
  const blobs = [
    {
      id: 1,
      // Top-right blob
      position: "top-[-20%] right-[-10%]",
      size: "w-[700px] h-[700px]",
      gradient: "from-gray-500/60 via-gray-400/50 to-gray-600/40",
      animation: {
        scale: [1, 1.3, 1],
        rotate: [0, 15, 0],
        x: [0, 60, 0],
        y: [0, -40, 0],
      },
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.5, 1], // Control animation timing points
      },
    },
    {
      id: 2,
      // Bottom-left blob
      position: "bottom-[-20%] left-[-10%]",
      size: "w-[650px] h-[650px]",
      gradient: "from-gray-600/55 via-gray-500/45 to-gray-700/35",
      animation: {
        scale: [1, 1.25, 1],
        rotate: [0, -12, 0],
        x: [0, -50, 0],
        y: [0, 35, 0],
      },
      transition: {
        duration: 18,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        delay: 3,
      },
    },
    {
      id: 3,
      // Center-right blob
      position: "top-[35%] right-[0%]",
      size: "w-[550px] h-[550px]",
      gradient: "from-gray-700/45 via-gray-600/50 to-gray-500/40",
      animation: {
        scale: [1, 1.2, 1],
        rotate: [0, 10, 0],
        x: [0, 45, 0],
        y: [0, -30, 0],
      },
      transition: {
        duration: 16,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        delay: 6,
      },
    },
  ];

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className={`absolute ${blob.position} ${blob.size} rounded-full bg-gradient-to-br ${blob.gradient} blur-3xl`}
          animate={blob.animation}
          transition={blob.transition}
          style={{
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
