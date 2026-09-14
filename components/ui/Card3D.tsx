"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glareIntensity?: number;
  elevateOnHover?: boolean;
}

export default function Card3D({
  children,
  className = "",
  intensity = 10,
  elevateOnHover = true,
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 220, mass: 0.4 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [intensity, -intensity]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-intensity, intensity]), springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const mouseXPos = (e.clientX - rect.left) / width - 0.5;
      const mouseYPos = (e.clientY - rect.top) / height - 0.5;

      mouseX.set(mouseXPos);
      mouseY.set(mouseYPos);
    },
    [mouseX, mouseY]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        WebkitFontSmoothing: "antialiased",
        backfaceVisibility: "hidden",
      }}
      animate={{
        y: isHovered && elevateOnHover ? -4 : 0,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`relative rounded-2xl [transform:translateZ(0)] ${className}`}
    >
      <div className="relative w-full h-full [transform:translateZ(0)] [backface-visibility:hidden]">
        {children}
      </div>
    </motion.div>
  );
}
