"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const map: [number, number, number][] = [
    [v, t, p],
    [q, v, p],
    [p, v, t],
    [p, q, v],
    [t, p, v],
    [v, p, q],
  ];
  const [r, g, b] = map[i];
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function hexToHsv(hex: string): { h: number; s: number; v: number } | null {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h, s, v };
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${parseFloat(alpha.toFixed(2))})`;
}

function rgbaToHex(rgba: string): string {
  const match = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return "#000000";
  return rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
}

function rgbaToAlpha(rgba: string): number {
  const match = rgba.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)/);
  return match ? parseFloat(match[1]) : 1;
}

export const presetColors: string[] = [
  "#000000",
  "#111111",
  "#222222",
  "#333333",
  "#555555",
  "#777777",
  "#999999",
  "#bbbbbb",
  "#dddddd",
  "#eeeeee",
  "#f5f5f5",
  "#ffffff",
  "#ff0000",
  "#cc0000",
  "#990000",
  "#ff3333",
  "#ff6666",
  "#ff9999",
  "#ffcccc",
  "#ffe5e5",
  "#ff6600",
  "#cc5200",
  "#ff8533",
  "#ffaa66",
  "#ffcc99",
  "#ffe5cc",
  "#ff4500",
  "#ff7043",
  "#ffcc00",
  "#ffdd33",
  "#ffee66",
  "#fff3aa",
  "#fff8d6",
  "#ffd700",
  "#f0c040",
  "#e6b800",
  "#00cc00",
  "#009900",
  "#006600",
  "#33dd33",
  "#66ee66",
  "#99ff99",
  "#ccffcc",
  "#00ff7f",
  "#00e676",
  "#69f0ae",
  "#00cccc",
  "#009999",
  "#006666",
  "#00ffff",
  "#33ffff",
  "#66ffff",
  "#99ffff",
  "#ccffff",
  "#00bcd4",
  "#26c6da",
  "#0000ff",
  "#0000cc",
  "#000099",
  "#3333ff",
  "#6666ff",
  "#9999ff",
  "#ccccff",
  "#1565c0",
  "#1e88e5",
  "#42a5f5",
  "#90caf9",
  "#bbdefb",
  "#6600cc",
  "#7700dd",
  "#9933ff",
  "#aa55ff",
  "#cc88ff",
  "#ddaaff",
  "#eeccff",
  "#f3e5ff",
  "#673ab7",
  "#9c27b0",
  "#ba68c8",
  "#ce93d8",
  "#ff0066",
  "#ff3388",
  "#ff66aa",
  "#ff99cc",
  "#ffbbdd",
  "#ffddee",
  "#ee88bb",
  "#cc4488",
  "#e91e63",
  "#f06292",
  "#f48fb1",
  "#fce4ec",
  "#8b4513",
  "#a0522d",
  "#cd853f",
  "#deb887",
  "#f5deb3",
  "#d2691e",
  "#bc8a5f",
  "#7b5e3c",
  "#5865f2",
  "#eb459e",
  "#fee75c",
  "#57f287",
  "#ed4245",
  "#faa61a",
  "#ff00ff",
  "#39ff14",
  "#0ff0fc",
  "#ff007f",
  "#7f00ff",
  "#ff7f00",
  "#0d1117",
  "#0d2137",
  "#1a237e",
  "#1a1a2e",
  "#16213e",
  "#0f3460",
  "#1b2a4a",
  "#263238",
];

interface CustomColorPickerProps {
  color: string;
  alpha: number;
  isRgba: boolean;
  onChangeHex: (hex: string) => void;
  onChangeAlpha: (alpha: number) => void;
}

function CustomColorPicker({
  color,
  alpha,
  isRgba,
  onChangeHex,
  onChangeAlpha,
}: CustomColorPickerProps) {
  const svCanvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);
  const opacityCanvasRef = useRef<HTMLCanvasElement>(null);

  const initialHsv = hexToHsv(color) ?? { h: 0, s: 1, v: 1 };
  const [hue, setHue] = useState(initialHsv.h);
  const [sat, setSat] = useState(initialHsv.s);
  const [val, setVal] = useState(initialHsv.v);
  const [hexInput, setHexInput] = useState(color);

  const draggingSV = useRef(false);
  const draggingHue = useRef(false);
  const draggingOpacity = useRef(false);

  const [r, g, b] = hsvToRgb(hue, sat, val);
  const currentHex = rgbToHex(r, g, b);

  useEffect(() => {
    const canvas = svCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;
    const [hr, hg, hb] = hsvToRgb(hue, 1, 1);
    const g1 = ctx.createLinearGradient(0, 0, w, 0);
    g1.addColorStop(0, "#ffffff");
    g1.addColorStop(1, `rgb(${hr},${hg},${hb})`);
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);
    const g2 = ctx.createLinearGradient(0, 0, 0, h);
    g2.addColorStop(0, "rgba(0,0,0,0)");
    g2.addColorStop(1, "#000000");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);
  }, [hue]);

  useEffect(() => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    for (let i = 0; i <= 360; i += 30) {
      const [r, g, b] = hsvToRgb(i, 1, 1);
      grad.addColorStop(i / 360, `rgb(${r},${g},${b})`);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (!isRgba) return;
    const canvas = opacityCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;
    const sz = 4;
    for (let y = 0; y < h; y += sz) {
      for (let x = 0; x < w; x += sz) {
        ctx.fillStyle =
          (Math.floor(x / sz) + Math.floor(y / sz)) % 2 === 0 ? "#bbb" : "#fff";
        ctx.fillRect(x, y, sz, sz);
      }
    }
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }, [isRgba, r, g, b]);

  const pickSV = useCallback(
    (e: MouseEvent | Touch) => {
      const canvas = svCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      setSat(x);
      setVal(1 - y);
      const [r, g, b] = hsvToRgb(hue, x, 1 - y);
      const hex = rgbToHex(r, g, b);
      onChangeHex(hex);
      setHexInput(hex);
    },
    [hue, onChangeHex],
  );

  const pickHue = useCallback(
    (e: MouseEvent | Touch) => {
      const canvas = hueCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newHue = x * 360;
      setHue(newHue);
      const [r, g, b] = hsvToRgb(newHue, sat, val);
      const hex = rgbToHex(r, g, b);
      onChangeHex(hex);
      setHexInput(hex);
    },
    [sat, val, onChangeHex],
  );

  const pickOpacity = useCallback(
    (e: MouseEvent | Touch) => {
      const canvas = opacityCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      onChangeAlpha(parseFloat((1 - y).toFixed(2)));
    },
    [onChangeAlpha],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (draggingSV.current) pickSV(e);
      if (draggingHue.current) pickHue(e);
      if (draggingOpacity.current) pickOpacity(e);
    };
    const onMouseUp = () => {
      draggingSV.current = false;
      draggingHue.current = false;
      draggingOpacity.current = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [pickSV, pickHue, pickOpacity]);

  return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="flex gap-2">
        <div
          className="relative rounded-md overflow-hidden cursor-crosshair select-none"
          style={{ width: 176, height: 160 }}
          onMouseDown={(e) => {
            draggingSV.current = true;
            pickSV(e.nativeEvent);
          }}
        >
          <canvas
            ref={svCanvasRef}
            width={176}
            height={160}
            className="w-full h-full"
            style={{ display: "block" }}
          />
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none"
            style={{
              left: `${sat * 100}%`,
              top: `${(1 - val) * 100}%`,
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
              background: currentHex,
            }}
          />
        </div>
        {isRgba && (
          <div
            className="relative rounded-full overflow-hidden cursor-pointer select-none flex-shrink-0"
            style={{ width: 14, height: 160 }}
            onMouseDown={(e) => {
              draggingOpacity.current = true;
              pickOpacity(e.nativeEvent);
            }}
          >
            <canvas
              ref={opacityCanvasRef}
              width={14}
              height={160}
              style={{ display: "block", width: 14, height: 160 }}
            />
            <div
              className="absolute rounded-full border-2 border-white pointer-events-none"
              style={{
                width: 18,
                height: 18,
                left: "50%",
                top: `${(1 - alpha) * 100}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
                background: hexToRgba(currentHex, alpha),
              }}
            />
          </div>
        )}
      </div>
      <div
        className="relative w-full rounded-full overflow-hidden cursor-pointer select-none"
        style={{ height: 14 }}
        onMouseDown={(e) => {
          draggingHue.current = true;
          pickHue(e.nativeEvent);
        }}
      >
        <canvas
          ref={hueCanvasRef}
          width={200}
          height={14}
          className="w-full h-full"
          style={{ display: "block" }}
        />
        <div
          className="absolute w-[18px] h-[18px] rounded-full border-2 border-white pointer-events-none"
          style={{
            left: `${(hue / 360) * 100}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
          }}
        />
      </div>
      <Input
        value={hexInput}
        maxLength={7}
        className="font-mono text-sm py-1"
        onChange={(e) => {
          let v = e.target.value;
          if (!v.startsWith("#")) v = "#" + v;
          setHexInput(v);
          if (/^#[0-9a-fA-F]{6}$/.test(v)) {
            const hsv = hexToHsv(v);
            if (hsv) {
              setHue(hsv.h);
              setSat(hsv.s);
              setVal(hsv.v);
              onChangeHex(v);
            }
          }
        }}
      />
    </div>
  );
}

interface ColorPickerProps {
  color: string;
  type?: "hex" | "rgba";
  onChange: (value: string) => void;
}

export function ColorPicker({
  color,
  type = "hex",
  onChange,
}: ColorPickerProps) {
  const isRgba = type === "rgba";
  const hexColor = color.startsWith("rgba") ? rgbaToHex(color) : color;
  const initialAlpha = color.startsWith("rgba") ? rgbaToAlpha(color) : 1;
  const [alpha, setAlpha] = useState(initialAlpha);
  const handleHex = useCallback(
    (hex: string) => {
      onChange(isRgba ? hexToRgba(hex, alpha) : hex);
    },
    [isRgba, alpha, onChange],
  );
  const handleAlpha = useCallback(
    (a: number) => {
      setAlpha(a);
      onChange(hexToRgba(hexColor, a));
    },
    [hexColor, onChange],
  );
  const handlePreset = useCallback(
    (hex: string) => {
      onChange(isRgba ? hexToRgba(hex, alpha) : hex);
    },
    [isRgba, alpha, onChange],
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="px-3 py-2 h-9 rounded-3xl bg-black/20 border border-white/10 hover:border-primary/10 flex items-center gap-2 select-none w-full">
          <div
            className="p-2 border border-primary/30 rounded-full"
            style={{ background: color }}
          />
          {hexColor}
        </button>
      </PopoverTrigger>
      <PopoverContent className="rounded-3xl w-[220px] mt-4">
        <div className="flex flex-col gap-3">
          <CustomColorPicker
            color={hexColor}
            alpha={alpha}
            isRgba={isRgba}
            onChangeHex={handleHex}
            onChangeAlpha={handleAlpha}
          />
          <ScrollArea className="h-32">
            <div className="grid grid-cols-8 pr-3 gap-2 w-full">
              {presetColors.map((c) => (
                <div
                  key={c}
                  className="aspect-square rounded-full cursor-pointer"
                  style={{ backgroundColor: c }}
                  onClick={() => handlePreset(c)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
