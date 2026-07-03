"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { getDecorations } from "@/lib/api/decorations";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconSearch,
  IconSparklesFilled,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaDiscord, FaSpinner } from "react-icons/fa6";
import { toast } from "sonner";
import { useUser } from "../../_user-provider";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

const AVATAR_SHAPES = [
  { shape: "CIRCLE" as const, className: "rounded-full" },
  { shape: "ROUNDED" as const, className: "rounded-lg" },
  { shape: "SQUARE" as const, className: "rounded-sm" },
] as const;

export default function AvatarBannerUploader({
  avatar,
  banner,
}: {
  banner: {
    value?: string | null;
    allowedTypes?: string[];
    onChange?: (url: string | null) => void;
  };
  avatar: {
    value?: string | null;
    decoration?: string | null;
    onDecorationChange?: (decoration: string | null) => void;
    onShapeChange?: (shape: "SQUARE" | "ROUNDED" | "CIRCLE") => void;
    onChange?: (url: string | null) => void;
    shape?: string;
  };
}) {
  const { user, setUser } = useUser();
  const avatarUrl = avatar.value ?? null;
  const bannerUrl = banner.value ?? null;
  const avatarShape = avatar.shape ?? "CIRCLE";
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [avatarDragOver, setAvatarDragOver] = useState(false);
  const [bannerDragOver, setBannerDragOver] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleShapeChange = (newShape: "CIRCLE" | "ROUNDED" | "SQUARE") => {
    avatar.onShapeChange?.(newShape);
  };

  const shapeClass =
    avatarShape === "CIRCLE"
      ? "rounded-full"
      : avatarShape === "ROUNDED"
        ? "rounded-lg"
        : "rounded-sm";

  const validateAndUploadAvatar = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`);
      return;
    }
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error();
      const url = await res.text();
      avatar.onChange?.(url);
      setUser({
        // using the "" is retarded but im too lazy to fix it :sob:
        username: user?.username ?? "",
        config: {
          ...user?.config,
          avatar_url: url,
        },
      });
    } catch {
      toast.error("Failed to upload avatar.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUploadAvatar(file);
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setAvatarDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUploadAvatar(file);
  };

  const handleAvatarRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    avatar.onChange?.(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    await fetch("/api/upload/avatar", { method: "DELETE" }).catch(() => {});
  };

  const bannerAllowedTypes = banner.allowedTypes ?? ALLOWED_TYPES;

  const validateAndUploadBanner = async (file: File) => {
    if (!bannerAllowedTypes.includes(file.type)) {
      toast.error(
        `Invalid file type. Allowed: ${bannerAllowedTypes.join(", ")}`,
      );
      return;
    }
    setBannerUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/banner", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error();
      const url = await res.text();
      banner.onChange?.(url);
    } catch {
      toast.error("Failed to upload banner.");
    } finally {
      setBannerUploading(false);
    }
  };

  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUploadBanner(file);
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setBannerDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUploadBanner(file);
  };

  const handleBannerRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    banner.onChange?.(null);
    if (bannerInputRef.current) bannerInputRef.current.value = "";
    await fetch("/api/upload/banner", { method: "DELETE" }).catch(() => {});
  };

  const selectedDecoration = avatar.decoration ?? null;

  const [decorations, setDecorations] = useState<string[]>([]);
  const [decoLoading, setDecoLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const itemsPerPage = 16;

  useEffect(() => {
    getDecorations().then((data) => {
      setDecorations(data);
      setDecoLoading(false);
    });
  }, []);

  const filteredDecorations = decorations.filter((decoration) =>
    decoration.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredDecorations.length / itemsPerPage);
  const paginatedDecorations = filteredDecorations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatDecorationName = (filename: string) => {
    return filename
      .replace(/\.(png|jpe?g|gif|webp)$/i, "")
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleDecorationSelect = (decoration: string | null) => {
    avatar.onDecorationChange?.(decoration);
    setDialogOpen(false);
  };

  const handleDiscordUpload = async () => {
    setAvatarUploading(true);
    try {
      const res = await fetch("/api/discord/profile-picture", {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      const url = await res.text();
      avatar.onChange?.(url);
      setUser({
        // using the "" is retarded but im too lazy to fix it :sob:
        username: user?.username ?? "",
        config: {
          ...user?.config,
          avatar_url: url,
        },
      });
    } catch {
      toast.error("Failed to upload avatar.");
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 px-2 lg:flex-row">
      <div className="flex flex-col gap-2 w-full lg:w-auto">
        <Label className="text-lg font-semibold">Avatar</Label>
        <div className="flex flex-row gap-4">
          <input
            ref={avatarInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            className="hidden"
            onChange={handleAvatarFileSelect}
          />
          <div className="relative group">
            <div
              className="relative h-32 w-32 cursor-pointer transition-all duration-300"
              onClick={() =>
                !avatarUploading && avatarInputRef.current?.click()
              }
              onDragOver={(e) => {
                e.preventDefault();
                setAvatarDragOver(true);
              }}
              onDragLeave={() => setAvatarDragOver(false)}
              onDrop={handleAvatarDrop}
            >
              <div
                className={`h-full w-full ${shapeClass} border-2 ${
                  avatarDragOver
                    ? "border-blue-400/70 border-dashed"
                    : "border-white/10 hover:border-white/30 border-dashed"
                } overflow-hidden transition-all duration-300 ${
                  avatarUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {avatarUploading ? (
                  <div className="h-full w-full bg-black/30 flex items-center justify-center">
                    <FaSpinner className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : avatarUrl ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={avatarUrl}
                      className="object-cover"
                      alt="Avatar"
                      fill
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-full w-full bg-black/30 flex items-center justify-center">
                    <img
                      src="https://cdn.discordapp.com/embed/avatars/0.png"
                      className="h-full w-full object-cover opacity-40"
                      alt="Default Avatar"
                    />
                  </div>
                )}
              </div>
              <div className="absolute -inset-2 pointer-events-none z-10">
                {selectedDecoration && (
                  <Image
                    src={`/decorations/${selectedDecoration}`}
                    alt="Decoration"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                )}
              </div>
              {!avatarUploading && (
                <div
                  className={`absolute inset-0 ${shapeClass} bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center`}
                >
                  <IconUpload size={24} className="text-white/60" />
                </div>
              )}
              {avatarUrl && !avatarUploading && (
                <button
                  onClick={handleAvatarRemove}
                  className={`absolute top-0 right-0 p-1.5 ${shapeClass} bg-red-900/80 border border-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 z-10`}
                >
                  <IconTrash size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-1">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5">
                  Select Decoration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[520px] p-0 gap-0 bg-[#0A0A0A] border-primary/[0.125]">
                <div className="flex flex-col gap-3 p-4">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-white/90">
                      <IconSparklesFilled className="text-primary" />
                      Avatar Decoration
                    </DialogTitle>
                  </DialogHeader>
                  <div className="relative">
                    <InputGroup>
                      <InputGroupInput
                        placeholder="Search decorations..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="h-8 text-sm bg-black/20 border-primary/10 text-white/90 placeholder:text-white/50 pr-8"
                      />
                      <InputGroupAddon>
                        {searchQuery ? (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="text-white/50 hover:text-white/70"
                          >
                            <IconX size={14} />
                          </button>
                        ) : (
                          <IconSearch size={14} className="text-white/40" />
                        )}
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                  <p className="text-[10px] text-white/40">
                    {filteredDecorations.length} results
                  </p>
                  {decoLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <FaSpinner className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="overflow-y-auto h-[365px] pr-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          onClick={() => handleDecorationSelect(null)}
                          className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center p-2 gap-1 transition-all ${
                            selectedDecoration === null
                              ? "border-primary/40 bg-primary/10"
                              : "border-primary/10 hover:border-primary/20 bg-[#0A0A0A]"
                          }`}
                        >
                          <div className="relative w-full h-12 flex items-center justify-center">
                            <IconX size={24} className="text-white/30" />
                          </div>
                          <span className="text-[10px] text-white/70 truncate w-full text-center">
                            None
                          </span>
                        </button>
                        {paginatedDecorations.map((decoration) => (
                          <button
                            key={decoration}
                            onClick={() => handleDecorationSelect(decoration)}
                            className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center p-2 gap-1 transition-all ${
                              selectedDecoration === decoration
                                ? "border-primary/40 bg-primary/10"
                                : "border-primary/10 hover:border-primary/20 bg-[#0A0A0A]"
                            }`}
                          >
                            <div className="relative w-full h-12 flex items-center justify-center">
                              <Image
                                src={`/decorations/${decoration}`}
                                alt={formatDecorationName(decoration)}
                                width={48}
                                height={48}
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                            <span className="text-[10px] text-white/70 truncate w-full text-center">
                              {formatDecorationName(decoration)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="w-7 h-7 rounded-md border border-primary/10 bg-[#0A0A0A] hover:bg-primary/10 hover:border-primary/20 disabled:opacity-40 disabled:cursor-not-allowed text-white/50 flex items-center justify-center"
                      >
                        <IconChevronsLeft size={12} />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="w-7 h-7 rounded-md border border-primary/10 bg-[#0A0A0A] hover:bg-primary/10 hover:border-primary/20 disabled:opacity-40 disabled:cursor-not-allowed text-white/50 flex items-center justify-center"
                      >
                        <IconChevronLeft size={12} />
                      </button>
                      <span className="text-xs text-white/50 px-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="w-7 h-7 rounded-md border border-primary/10 bg-[#0A0A0A] hover:bg-primary/10 hover:border-primary/20 disabled:opacity-40 disabled:cursor-not-allowed text-white/50 flex items-center justify-center"
                      >
                        <IconChevronRight size={12} />
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="w-7 h-7 rounded-md border border-primary/10 bg-[#0A0A0A] hover:bg-primary/10 hover:border-primary/20 disabled:opacity-40 disabled:cursor-not-allowed text-white/50 flex items-center justify-center"
                      >
                        <IconChevronsRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant={"discord"}
              onClick={handleDiscordUpload}
              className="flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 mt-2"
            >
              <FaDiscord /> Use Discord Avatar
            </Button>
            <div className="mt-0 flex flex-col gap-2">
              <Label className="text-xs">Avatar Shape</Label>
              <section className="flex flex-row gap-4">
                {AVATAR_SHAPES.map(({ shape, className }) => (
                  <div
                    key={shape}
                    onClick={() => handleShapeChange(shape)}
                    className={`cursor-pointer border-2 border-primary p-3 transition-colors hover:bg-primary/10 ${className} ${
                      avatarShape === shape ? "" : "opacity-50"
                    }`}
                  />
                ))}
              </section>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <Label className="text-lg font-semibold">Banner</Label>
        <input
          ref={bannerInputRef}
          type="file"
          accept={bannerAllowedTypes.join(",")}
          className="hidden"
          onChange={handleBannerFileSelect}
        />
        <div className="relative group">
          <div
            className={`relative w-full h-36 rounded-lg border-2 ${
              bannerDragOver
                ? "border-blue-400/70 border-dashed"
                : "border-white/10 hover:border-white/30 border-dashed"
            } overflow-hidden cursor-pointer transition-all duration-300 ${
              bannerUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => !bannerUploading && bannerInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setBannerDragOver(true);
            }}
            onDragLeave={() => setBannerDragOver(false)}
            onDrop={handleBannerDrop}
          >
            {bannerUploading ? (
              <div className="h-full w-full bg-black/30 flex flex-col items-center justify-center gap-1">
                <FaSpinner className="w-6 h-6 animate-spin text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Uploading...</p>
              </div>
            ) : bannerUrl ? (
              <Image
                src={bannerUrl}
                className="object-cover"
                alt="Banner"
                fill
                unoptimized
              />
            ) : (
              <div className="h-full w-full bg-black/30 flex flex-col items-center justify-center gap-1">
                <IconUpload size={20} className="text-primary mb-2" />
                <p className="text-xs text-muted-foreground">
                  Drag and drop file here or{" "}
                  <span className="text-primary">Browse Files</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  PNG, JPG, GIF, WEBP
                </p>
              </div>
            )}
            {bannerUrl && !bannerUploading && (
              <div className="absolute inset-0 rounded-lg bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <IconUpload size={24} className="text-white/60" />
              </div>
            )}
          </div>
          {bannerUrl && !bannerUploading && (
            <button
              onClick={handleBannerRemove}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-red-900/80 border border-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 z-10"
            >
              <IconTrash size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
