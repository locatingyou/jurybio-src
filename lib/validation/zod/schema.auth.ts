import { z } from "zod";

const RESERVED_URLS = new Set([
  "legal",
  "privacy",
  "terms",
  "auth",
  "verification",
  "dashboard",
  "settings",
  "profile",
  "api",
  "ratelimit",
]);

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(16, "Username must be at most 16 characters")
    .regex(
      /^[a-z0-9-]+$/i,
      "Username can only contain letters, numbers, and hyphens",
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  url: z
    .string()
    .min(1, "URL is required")
    .max(64, "URL must be at most 64 characters")
    .trim()
    .regex(
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      "URL can only contain letters, numbers, and hyphens",
    )
    .refine((u) => !RESERVED_URLS.has(u.toLowerCase()), "This URL is reserved"),

  cloudflare: z.string().min(1, "Captcha verification is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  cloudflare: z.string().min(1, "Captcha verification is required"),
});

// reset but fuk it staying here
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  cloudflare: z.string().min(1, "Captcha verification is required"),
});
