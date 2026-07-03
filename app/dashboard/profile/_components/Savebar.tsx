"use client";
import { useSaveBar } from "@/lib/stores/save-bar";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";

export function SaveBar() {
  const { pending, clear } = useSaveBar();
  const [saving, setSaving] = useState(false);
  const isDirty = Object.keys(pending).length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pending),
      });
      if (!res.ok) throw new Error();
      clear();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.8,
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="backdrop-blur-lg bg-linear-to-bl from-card via-background to-background shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/10 rounded-full px-4 w-xl py-2 flex items-center justify-between">
            <div
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
              aria-hidden="true"
            />
            <span className="text-base text-white/90">
              Careful — you have unsaved changes!
            </span>
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <IconDeviceFloppy size={18} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
          <div
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
