"use client";
import DOMPurify from "dompurify";
import { useState, useEffect } from "react";

export default function Description({
  config,
}: {
  config: { description: string | null; text_color: string };
}) {
  const [clean, setClean] = useState("");

  useEffect(() => {
    if (config.description) {
      setClean(DOMPurify.sanitize(config.description));
    }
  }, [config.description]);

  if (!clean) return null;

  return (
    <div
      className="tiptap"
      style={{ color: config.text_color }}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
