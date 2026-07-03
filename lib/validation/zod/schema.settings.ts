import { z } from "zod";

export const settingsSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-z0-9-]+$/i).optional(),
  email: z.string().email().optional(),
  url: z.string().min(1).max(64).optional(),
  lastfmUsername: z.string().min(1).max(64).optional(),
  disconnectLastfm: z.boolean().optional(),
  disconnectDiscord: z.boolean().optional(),
  password: z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
  }).optional(),
});
