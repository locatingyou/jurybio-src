"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  Turnstile as CloudflareTurnstile,
  TurnstileInstance,
} from "@marsidev/react-turnstile";

export const Turnstile = forwardRef<
  { reset: () => void; execute: () => void; getResponse: () => string | null },
  {
    siteKey: string;
    options?: {
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact" | "invisible" | "flexible";
    };
    onSuccess?: (token: string) => void;
    onExpire?: () => void;
  }
>(({ siteKey, onSuccess, onExpire, options = {} }, ref) => {
  const widgetRef = useRef<TurnstileInstance | null>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      widgetRef.current?.reset();
    },
    execute: () => {
      try {
        widgetRef.current?.execute?.();
      } catch (e) {}
    },
    getResponse: () => {
      try {
        return widgetRef.current?.getResponse?.() ?? null;
      } catch (e) {
        return null;
      }
    },
  }));

  const handleExpire = () => {
    onExpire?.();
    widgetRef.current?.reset();
    try {
      widgetRef.current?.execute?.();
    } catch (e) {}
  };

  return (
    <CloudflareTurnstile
      ref={(instance) => {
        widgetRef.current = instance ?? null;
      }}
      siteKey={siteKey}
      onSuccess={onSuccess}
      onExpire={handleExpire}
      options={{
        theme: "dark",
        ...options,
      }}
    />
  );
});

Turnstile.displayName = "Turnstile";
