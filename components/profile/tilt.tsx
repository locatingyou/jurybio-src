"use client";
import { useRef, useState, Children, CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export function Tilt({
  children,
  tiltMaxAngle = 15,
  perspective = 1000,
  transitionSpeed = 0.4,
  enableLayers = true,
  layerDepth = 20,
  style,
}: {
  children: React.ReactNode;
  tiltMaxAngle?: number;
  perspective?: number;
  scale?: number;
  transitionSpeed?: number;
  enableLayers?: boolean;
  layerDepth?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const rotateX = useSpring(
    useTransform(y, [-0.5, 0.5], [tiltMaxAngle, -tiltMaxAngle]),
    springConfig,
  );
  const rotateY = useSpring(
    useTransform(x, [-0.5, 0.5], [-tiltMaxAngle, tiltMaxAngle]),
    springConfig,
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const renderContent = () => {
    if (!enableLayers) {
      return children;
    }
    return Children.map(children, (child, index) => (
      <TiltLayer key={index} depth={(index + 1) * layerDepth}>
        {child}
      </TiltLayer>
    ));
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
        isolation: "isolate",
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        transition={{
          duration: transitionSpeed,
          ease: "easeOut",
        }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}

export function TiltLayer({
  children,
  depth = 20,
  className = "",
}: {
  children: React.ReactNode;
  depth?: number;
  className?: string;
}) {
  return (
    <div
      style={{
        transform: `translateZ(${depth}px)`,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </div>
  );
}
