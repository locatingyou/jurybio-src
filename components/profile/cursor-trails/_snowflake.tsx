"use client";

import React, { useEffect, useRef } from "react";

interface SnowflakeCursorOptions {
  element?: HTMLElement;
  className?: string;
  color?: string;
}

const SnowflakeCursor: React.FC<SnowflakeCursorOptions> = ({
  element,
  color = "#FFFFFF",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<any[]>([]);
  const canvImages = useRef<HTMLCanvasElement[]>([]);
  const animationFrame = useRef<number | null>(null);
  const prefersReducedMotion = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    const targetElement = element || document.body;

    canvas.style.position = element ? "absolute" : "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";

    targetElement.appendChild(canvas);
    canvasRef.current = canvas;

    const setCanvasSize = () => {
      canvas.width = element ? targetElement.clientWidth : window.innerWidth;
      canvas.height = element ? targetElement.clientHeight : window.innerHeight;
    };

    const drawSnowflake = (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";

      // Draw 6 simple arms
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
        ctx.stroke();
      }
    };

    const createSnowflakeImages = () => {
      const sizes = [4, 5, 6];

      sizes.forEach((size) => {
        const bgCanvas = document.createElement("canvas");
        const bgContext = bgCanvas.getContext("2d");
        if (!bgContext) return;

        const canvasSize = size * 3;
        bgCanvas.width = canvasSize;
        bgCanvas.height = canvasSize;

        bgContext.translate(canvasSize / 2, canvasSize / 2);
        drawSnowflake(bgContext, size);

        canvImages.current.push(bgCanvas);
      });
    };

    const addParticle = (x: number, y: number) => {
      const randomImage =
        canvImages.current[
          Math.floor(Math.random() * canvImages.current.length)
        ];
      particles.current.push(new Particle(x, y, randomImage));
    };

    const onMouseMove = (e: MouseEvent) => {
      const x = element
        ? e.clientX - targetElement.getBoundingClientRect().left
        : e.clientX;
      const y = element
        ? e.clientY - targetElement.getBoundingClientRect().top
        : e.clientY;
      addParticle(x, y);
    };

    const updateParticles = () => {
      if (!context || !canvas) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((particle, index) => {
        particle.update(context);
        if (particle.lifeSpan < 0) {
          particles.current.splice(index, 1);
        }
      });
    };

    const animationLoop = () => {
      updateParticles();
      animationFrame.current = requestAnimationFrame(animationLoop);
    };

    const init = () => {
      if (prefersReducedMotion.current?.matches) return;

      setCanvasSize();
      createSnowflakeImages();

      targetElement.addEventListener("mousemove", onMouseMove);
      window.addEventListener("resize", setCanvasSize);

      animationLoop();
    };

    const destroy = () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      targetElement.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", setCanvasSize);
      particles.current = [];
      canvImages.current = [];
    };

    prefersReducedMotion.current.onchange = () => {
      if (prefersReducedMotion.current?.matches) {
        destroy();
      } else {
        init();
      }
    };

    init();
    return () => destroy();
  }, [element, color]);

  return null;
};

/**
 * Particle Class
 */
class Particle {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  lifeSpan: number;
  initialLifeSpan: number;
  canv: HTMLCanvasElement;
  rotation: number;
  rotationSpeed: number;

  constructor(x: number, y: number, canvasItem: HTMLCanvasElement) {
    this.position = { x, y };
    this.velocity = {
      x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2),
      y: 1 + Math.random() * 0.5,
    };
    this.lifeSpan = Math.floor(Math.random() * 60 + 80);
    this.initialLifeSpan = this.lifeSpan;
    this.canv = canvasItem;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
  }

  update(context: CanvasRenderingContext2D) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.lifeSpan--;
    this.rotation += this.rotationSpeed;

    this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
    this.velocity.y -= Math.random() / 400;

    const scale = Math.max(this.lifeSpan / this.initialLifeSpan, 0);

    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation);
    context.scale(scale, scale);
    context.globalAlpha = scale;
    context.drawImage(this.canv, -this.canv.width / 2, -this.canv.height / 2);
    context.restore();
  }
}

export default SnowflakeCursor;
