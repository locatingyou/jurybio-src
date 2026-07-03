"use client";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  IconCircleCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertOctagon,
  IconLoader,
} from "@tabler/icons-react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <IconCircleCheck className="size-4 text-emerald-400" />,
        info: <IconInfoCircle className="size-4 text-sky-400" />,
        warning: <IconAlertTriangle className="size-4 text-amber-400" />,
        error: <IconAlertOctagon className="size-4 text-rose-400" />,
        loading: <IconLoader className="size-4 animate-spin text-foreground" />,
      }}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--border-radius": "15px",
        } as React.CSSProperties
      }
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "cn-toast !border !border-white/10 !shadow-none backdrop-blur-md",
          success: "!bg-emerald-950/40 !border-emerald-500/20",
          info: "!bg-sky-950/40 !border-sky-500/20",
          warning: "!bg-amber-950/40 !border-amber-500/20",
          error: "!bg-rose-950/40 !border-rose-500/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
