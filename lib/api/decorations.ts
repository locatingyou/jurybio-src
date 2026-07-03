"use server";

import fs from "fs";
import path from "path";

let cachedDecorations: string[] | null = null;

export async function getDecorations(): Promise<string[]> {
  if (cachedDecorations !== null) {
    return cachedDecorations;
  }

  try {
    const decorationsDir = path.join(process.cwd(), "public", "decorations");

    if (!fs.existsSync(decorationsDir)) {
      console.error("Decorations directory not found:", decorationsDir);
      cachedDecorations = [];
      return [];
    }

    const files = fs.readdirSync(decorationsDir);
    const decorations = files.filter(
      (file) =>
        file.toLowerCase().endsWith(".png") ||
        file.toLowerCase().endsWith(".jpg") ||
        file.toLowerCase().endsWith(".jpeg") ||
        file.toLowerCase().endsWith(".gif") ||
        file.toLowerCase().endsWith(".webp"),
    );

    cachedDecorations = decorations;
    console.log(`Found ${decorations.length} decoration files`);
    return decorations;
  } catch (error) {
    console.error("Error fetching decorations:", error);
    cachedDecorations = [];
    return [];
  }
}
