"use client";
import { useEffect, useRef } from "react";

export default function Cursor({ color }: { color: string }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      *,
      *::before,
      *::after {
        cursor: none !important;
      }
      @keyframes glow {
        0%, 100% {
          box-shadow: 0 0 10px var(--cursor-color), 0 0 20px var(--cursor-color);
        }
        50% {
          box-shadow: 0 0 20px var(--cursor-color), 0 0 40px var(--cursor-color);
        }
      }
      .cursor-dot {
        animation: glow 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    return () => style.remove();
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", move);

    let raf: number;
    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.15;
      pos.current.y += (target.current.y - pos.current.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed left-0 top-0 z-[999999999] hidden md:block"
      style={{ "--cursor-color": color } as React.CSSProperties}
    >
      <div
        className="h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-dot"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
