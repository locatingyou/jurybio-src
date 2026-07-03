"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconUpload,
  IconX,
  IconArrowLeft,
  IconCloudUpload,
  IconTrashFilled,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { FaSpinner } from "react-icons/fa6";
import { configAtom, useSaveBar } from "@/lib/stores/save-bar";
import { useAtom } from "jotai";

type Font = {
  id: string;
  url: string;
  position: number;
  title: string;
};

type View = "manager" | "uploader";

export default function FontManager({
  fonts,
}: {
  fonts: Font[] | null;
}) {
  const [currentConfig, setCurrentConfig] = useAtom(configAtom);
  const [fontList, setFontList] = useState<Font[]>(fonts ?? []);
  const [view, setView] = useState<View>("manager");
  const [open, setOpen] = useState(false);
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/upload/font?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const updated = fontList.filter((f) => f.id !== id);
        setFontList(updated);
        setCurrentConfig((prev) => ({ ...prev, fonts: updated }));
        
        // If the current font_family is the deleted font, reset it
        if (currentConfig.font_family === fontList.find(f => f.id === id)?.title) {
          setCurrentConfig((prev) => ({ ...prev, font_family: "Sora" }));
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete font.");
      }
    } catch {
      toast.error("Failed to delete font. Try again.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a font file.");
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title || selectedFile.name.split(".")[0]);

    try {
      const res = await fetch("/api/upload/font", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newFont: Font = await res.json();
        const updated = [...fontList, newFont];
        setFontList(updated);
        setCurrentConfig((prev) => ({ ...prev, fonts: updated }));
        
        // Reset form
        setSelectedFile(null);
        setTitle("");
        setView("manager");
        toast.success("Font uploaded successfully!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to upload font.");
      }
    } catch {
      toast.error("Failed to upload font. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setTitle("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleFileSelect = (file: File) => {
    const validExtensions = ["ttf", "otf", "woff", "woff2"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    
    if (!ext || !validExtensions.includes(ext)) {
      toast.error("Invalid file type. Please use .ttf, .otf, .woff, or .woff2");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10MB");
      return;
    }
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.split(".")[0]);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setTimeout(() => {
            setView("manager");
            resetUploadState();
          }, 200);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full flex gap-2">
          <IconUpload size={16} /> Manage Fonts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#09090b] border-white/10 text-white p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Font Manager</DialogTitle>
        
        {view === "manager" ? (
          <div className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <IconUpload size={20} />
                </div>
                <div>
                  <h2 className="text-base font-medium">Font Manager</h2>
                  <p className="text-xs text-white/40">
                    Upload and manage custom fonts
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                <IconX size={18} className="text-white/40" />
              </Button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {fontList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40 gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                    <IconUpload size={24} className="text-white/20" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/60">
                      No fonts uploaded yet
                    </p>
                    <p className="text-xs">Premium users can upload up to 5 custom fonts</p>
                  </div>
                </div>
              ) : (
                fontList.map((font) => (
                  <div
                    key={font.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{font.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDelete(font.id)}
                    >
                      <IconTrashFilled size={16} />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
              <Button
                className="w-full bg-white text-black hover:bg-white/90"
                onClick={() => setView("uploader")}
              >
                Upload Font
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/[0.02]">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-white/5 -ml-1"
                onClick={() => {
                  setView("manager");
                  resetUploadState();
                }}
              >
                <IconArrowLeft size={18} className="text-white/60" />
              </Button>
              <div>
                <h2 className="text-base font-medium">Upload Font</h2>
                <p className="text-xs text-white/40">
                  Add a new custom font (.ttf, .otf, .woff)
                </p>
              </div>
            </div>

            {/* Uploader Content */}
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconCloudUpload size={28} className="text-white/40" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/80">
                      Click or drag font file here
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      Up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <span className="text-indigo-400 font-medium">
                        {selectedFile.name.split(".").pop()?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-white/40">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/40 hover:text-white"
                      onClick={resetUploadState}
                      disabled={uploading}
                    >
                      <IconX size={16} />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-white/60 uppercase tracking-wider font-semibold">
                      Font Name (Must match file exactly)
                    </Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. MyCustomFont"
                      className="bg-white/5 border-white/10"
                      disabled={uploading}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
              <Button
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                onClick={handleUpload}
                disabled={!selectedFile || !title || uploading}
              >
                {uploading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  "Upload Font"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
