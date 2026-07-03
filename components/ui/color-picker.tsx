"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function hexToHsv(hex: string): [number, number, number] {
  const h = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }
  return [hue, max === 0 ? 0 : d / max, max];
}

function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const hex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${hex(f(5))}${hex(f(3))}${hex(f(1))}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").padEnd(6, "0");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function ColorPickerPanel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(value));
  const [hexInput, setHexInput] = useState(value.replace("#", "").toUpperCase());
  const [rgb, setRgb] = useState<[number, number, number]>(() => hexToRgb(value));
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const [hue, sat, val] = hsv;

  useEffect(() => {
    setHsv(hexToHsv(value));
    setHexInput(value.replace("#", "").toUpperCase());
    setRgb(hexToRgb(value));
  }, [value]);

  const updateFromHsv = useCallback((h: number, s: number, v: number) => {
    const hex = hsvToHex(h, s, v);
    setHsv([h, s, v]);
    setHexInput(hex.replace("#", "").toUpperCase());
    setRgb(hexToRgb(hex));
    onChange(hex);
  }, [onChange]);

  const handleCanvas = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    updateFromHsv(hue, x, 1 - y);
  }, [hue, updateFromHsv]);

  useEffect(() => {
    const move = (e: MouseEvent) => { if (dragging.current) handleCanvas(e); };
    const up = () => { dragging.current = false; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [handleCanvas]);

  const pureHue = hsvToHex(hue, 1, 1);

  return (
    <div className="w-60 flex flex-col gap-3 p-3 rounded-xl bg-[#0d0d0d] border border-white/10 shadow-xl">
      <div
        ref={canvasRef}
        className="relative w-full h-36 rounded-lg cursor-crosshair select-none overflow-hidden"
        style={{ background: pureHue }}
        onMouseDown={(e) => { dragging.current = true; handleCanvas(e); }}
      >
        <div className="absolute inset-0 rounded-lg" style={{ background: "linear-gradient(to right, #fff, transparent)" }} />
        <div className="absolute inset-0 rounded-lg" style={{ background: "linear-gradient(to bottom, transparent, #000)" }} />
        <div
          className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none ring-1 ring-black/30"
          style={{ left: `${sat * 100}%`, top: `${(1 - val) * 100}%`, background: value }}
        />
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md shrink-0 border border-white/10 shadow-inner" style={{ background: value }} />
        <div className="flex-1 relative">
          <input
            type="range"
            min={0}
            max={360}
            value={hue}
            onChange={(e) => updateFromHsv(Number(e.target.value), sat, val)}
            className="w-full h-2.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20"
            style={{ background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {(["R", "G", "B"] as const).map((ch, i) => (
          <div key={ch} className="flex flex-col items-center gap-1">
            <input
              type="number"
              min={0}
              max={255}
              value={rgb[i]}
              onChange={(e) => {
                const n = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
                const next: [number, number, number] = [...rgb] as [number, number, number];
                next[i] = n;
                setRgb(next);
                const hex = `#${next.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
                setHsv(hexToHsv(hex));
                setHexInput(hex.replace("#", "").toUpperCase());
                onChange(hex);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-md text-center text-xs py-1.5 outline-none focus:border-white/25 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[10px] text-blue-400/80">{ch}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-1">
          <div className="w-full bg-white/5 border border-white/10 rounded-md flex items-center justify-center text-xs py-1.5 text-white/20 select-none">⇅</div>
          <span className="text-[10px] text-transparent select-none">_</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
        <span className="text-white/30 text-xs">#</span>
        <input
          type="text"
          value={hexInput}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9a-fA-F]/g, "");
            setHexInput(v.toUpperCase());
            if (v.length === 6) {
              const hex = `#${v}`;
              setHsv(hexToHsv(hex));
              setRgb(hexToRgb(hex));
              onChange(hex);
            }
          }}
          maxLength={6}
          className="flex-1 bg-transparent text-xs outline-none uppercase tracking-widest"
        />
        <div className="w-4 h-4 rounded shrink-0" style={{ background: value }} />
      </div>
    </div>
  );
}

export function ColorPicker({
  label,
  value,
  onChange,
  className,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <PopoverPrimitive.Root>
      <div className={cn("flex flex-col gap-1.5", className)}>
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-2.5 w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 hover:border-white/20 transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 rounded-md border border-white/20 shrink-0" style={{ background: value }} />
            <span className="text-sm text-white/60 uppercase tracking-widest font-mono">
              {value.replace("#", "")}
            </span>
          </button>
        </PopoverPrimitive.Trigger>
      </div>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content side="bottom" align="start" sideOffset={6} className="z-50">
          <ColorPickerPanel value={value} onChange={onChange} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
