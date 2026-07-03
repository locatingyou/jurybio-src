"use client";
import { motion, type Variants } from "framer-motion";

export default function Animation({
  card_animation,
  children,
}: {
  card_animation:
    | "None"
    | "Slide Up"
    | "Slide Down"
    | "Zoom In"
    | "Zoom Out"
    | "Bounce";
  children: React.ReactNode;
}) {
  const variants: Record<string, Variants> = {
    None: {
      hidden: {},
      visible: {},
    },
    "Slide Up": {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 },
    },
    "Slide Down": {
      hidden: { opacity: 0, y: -50 },
      visible: { opacity: 1, y: 0 },
    },
    "Zoom In": {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    "Zoom Out": {
      hidden: { opacity: 0, scale: 1.2 },
      visible: { opacity: 1, scale: 1 },
    },
    Bounce: {
      hidden: { opacity: 0, y: -30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 10,
        },
      },
    },
  };

  return (
    <motion.div
      variants={variants[card_animation]}
      initial="hidden"
      animate="visible"
      transition={
        card_animation !== "Bounce"
          ? { duration: 0.4, ease: "easeOut" }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
