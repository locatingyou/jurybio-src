import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconDeviceAirpods,
  IconDeviceDesktopFilled,
  IconPhotoFilled,
  IconUpload,
  IconX,
  IconArrowLeft,
  IconCloudUpload,
  IconGripVertical,
  IconTrashFilled,
  IconMusic,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconFileTextFilled,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { FaSpinner } from "react-icons/fa6";
import { configAtom, useSaveBar } from "@/lib/stores/save-bar";
import { useAtom } from "jotai";
import { Textarea } from "@/components/ui/textarea";

type Background = {
  id: string;
  url: string;
  position: number;
  title: string;
  file_type: "image" | "video";
};

type Audio = {
  id: string;
  url: string;
  cover_url: string | null;
  lyrics: string | null;
  position: number;
  title: string;
  artist: string | null;
};

type View = "manager" | "uploader";

const isVideoFile = (name: string) => /\.(mp4|webm|ogg|mov)$/i.test(name);

const getFileExtension = (name: string) =>
  name.split(".").pop()?.toLowerCase() || "";

function SortableBackground({
  bg,
  onDelete,
}: {
  bg: Background;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bg.id });

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (deleting) return;
    setDeleting(true);
    await onDelete(bg.id);
    setDeleting(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
    >
      <div className="w-16 h-10 rounded-md overflow-hidden border border-white/10 shrink-0">
        {bg.file_type === "video" ? (
          <video
            src={bg.url}
            className="w-full h-full object-cover"
            muted
            autoPlay
            loop
          />
        ) : (
          <img
            src={bg.url}
            alt={bg.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <p className="flex-1 truncate text-base font-medium">{bg.title}</p>
      <Button
        onClick={handleDelete}
        disabled={deleting}
        variant="destructive"
        size="icon"
      >
        {deleting ? (
          <FaSpinner size={16} className="animate-spin" />
        ) : (
          <IconTrashFilled size={16} />
        )}
      </Button>
      <Button
        {...attributes}
        {...listeners}
        size="icon"
        variant="ghost"
        className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing shrink-0 touch-none"
      >
        <IconGripVertical size={16} />
      </Button>
    </div>
  );
}

function SortableAudio({
  audio,
  onDelete,
}: {
  audio: Audio;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: audio.id });

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (deleting) return;
    setDeleting(true);
    await onDelete(audio.id);
    setDeleting(false);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
    >
      <audio
        ref={audioRef}
        src={audio.url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
      <button
        onClick={togglePlay}
        className="relative w-10 h-10 rounded-md overflow-hidden border border-white/10 shrink-0 group/cover"
      >
        {audio.cover_url ? (
          <img
            src={audio.cover_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <IconMusic size={16} className="text-muted-foreground/50" />
          </div>
        )}
        <div
          className={[
            "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity",
            playing ? "opacity-100" : "opacity-0 group-hover/cover:opacity-100",
          ].join(" ")}
        >
          {playing ? (
            <IconPlayerPauseFilled size={14} className="text-white" />
          ) : (
            <IconPlayerPlayFilled size={14} className="text-white" />
          )}
        </div>
      </button>
      <div className="flex-1 min-w-0 flex flex-col">
        <p className="truncate text-base font-medium leading-tight">
          {audio.title}
        </p>
        {audio.artist && (
          <p className="truncate text-xs text-muted-foreground leading-tight">
            {audio.artist}
          </p>
        )}
      </div>
      <Button
        onClick={handleDelete}
        disabled={deleting}
        variant="destructive"
        size="icon"
      >
        {deleting ? (
          <FaSpinner size={16} className="animate-spin" />
        ) : (
          <IconTrashFilled size={16} />
        )}
      </Button>
      <Button
        {...attributes}
        {...listeners}
        size="icon"
        variant="ghost"
        className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing shrink-0 touch-none"
      >
        <IconGripVertical size={16} />
      </Button>
    </div>
  );
}

export default function BackgroundAudioManager({
  backgrounds,
  audios,
  config,
  premium = false,
  onReorder,
  onAudioReorder,
}: {
  backgrounds: Background[] | null;
  audios: Audio[] | null;
  premium?: boolean;
  config: {
    background_mute: boolean;
    background_shuffle: boolean;
  };
  onReorder?: (backgrounds: Background[]) => void;
  onAudioReorder?: (audios: Audio[]) => void;
}) {
  const [, setCurrentConfig] = useAtom(configAtom);
  const { update } = useSaveBar();
  const maxItems = premium ? 3 : 1;

  const [bgList, setBgList] = useState<Background[]>(backgrounds ?? []);
  const [bgView, setBgView] = useState<View>("manager");
  const [bgDragging, setBgDragging] = useState(false);
  const [bgPreview, setBgPreview] = useState<{
    file: File;
    name: string;
    url: string;
  } | null>(null);
  const [bgTitle, setBgTitle] = useState("");
  const [bgUploading, setBgUploading] = useState(false);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const [audioList, setAudioList] = useState<Audio[]>(audios ?? []);
  const [audioView, setAudioView] = useState<View>("manager");
  const [audioDragging, setAudioDragging] = useState(false);
  const [coverDragging, setCoverDragging] = useState(false);
  const [audioPreview, setAudioPreview] = useState<{
    file: File;
    name: string;
    url: string;
  } | null>(null);
  const [coverPreview, setCoverPreview] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const [audioTitle, setAudioTitle] = useState("");
  const [audioArtist, setAudioArtist] = useState("");
  const [audioLyrics, setAudioLyrics] = useState("");
  const [audioUploading, setAudioUploading] = useState(false);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // --- Lyrics search state ---
  const [lyricsSearching, setLyricsSearching] = useState(false);
  const [lyricsTriggered, setLyricsTriggered] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleBgDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(
      bgList,
      bgList.findIndex((b) => b.id === active.id),
      bgList.findIndex((b) => b.id === over.id),
    ).map((b, i) => ({ ...b, position: i }));
    setBgList(reordered);
    update({ backgrounds: reordered });
    onReorder?.(reordered);
  };

  const handleAudioDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(
      audioList,
      audioList.findIndex((a) => a.id === active.id),
      audioList.findIndex((a) => a.id === over.id),
    ).map((a, i) => ({ ...a, position: i }));
    setAudioList(reordered);
    update({ audios: reordered });
    onAudioReorder?.(reordered);
  };

  const handleBgFile = (file: File) => {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/"))
      return;
    setBgPreview({ file, name: file.name, url: URL.createObjectURL(file) });
    setBgTitle((prev) => prev || file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleAudioFile = (file: File) => {
    if (!file.type.startsWith("audio/")) return;
    setAudioPreview({
      file,
      name: file.name,
      url: URL.createObjectURL(file),
    });
    setAudioTitle((prev) => prev || file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleCoverFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setCoverPreview({ file, url: URL.createObjectURL(file) });
  };

  const handleBgDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/upload/background?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      const updated = bgList
        .filter((b) => b.id !== id)
        .map((b, i) => ({ ...b, position: i }));
      setBgList(updated);
      update({ backgrounds: updated });
      setCurrentConfig((prev) => ({ ...prev, backgrounds: updated }));
      onReorder?.(updated);
    } catch {
      toast.error("Failed to delete background. Try again.");
    }
  };

  const handleAudioDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/upload/audio?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      const updated = audioList
        .filter((a) => a.id !== id)
        .map((a, i) => ({ ...a, position: i }));
      setAudioList(updated);
      update({ audios: updated });
      setCurrentConfig((prev) => ({ ...prev, audios: updated }));
      onAudioReorder?.(updated);
    } catch {
      toast.error("Failed to delete audio. Try again.");
    }
  };

  const clearBgPreview = () => {
    if (bgPreview) URL.revokeObjectURL(bgPreview.url);
    setBgPreview(null);
  };

  const clearAudioPreview = () => {
    if (audioPreview) URL.revokeObjectURL(audioPreview.url);
    if (coverPreview) URL.revokeObjectURL(coverPreview.url);
    setAudioPreview(null);
    setCoverPreview(null);
  };

  const handleBgBack = () => {
    clearBgPreview();
    setBgTitle("");
    setBgView("manager");
  };

  const handleAudioBack = () => {
    clearAudioPreview();
    setAudioTitle("");
    setAudioArtist("");
    setAudioLyrics("");
    setLyricsTriggered(false);
    setAudioView("manager");
  };

  const handleBgConfirm = async () => {
    if (!bgPreview) return;
    setBgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", bgPreview.file);
      fd.append("title", bgTitle);
      const res = await fetch("/api/upload/background", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error();
      const newBg: Background = await res.json();
      const updated = [...bgList, { ...newBg, position: bgList.length }];
      setBgList(updated);
      setCurrentConfig((prev) => ({ ...prev, backgrounds: updated }));
      handleBgBack();
    } catch {
      toast.error("Failed to upload background. Try again.");
    } finally {
      setBgUploading(false);
    }
  };

  const handleAudioConfirm = async () => {
    if (!audioPreview) return;
    setAudioUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", audioPreview.file);
      fd.append("title", audioTitle);
      fd.append("artist", audioArtist);
      fd.append("lyrics", audioLyrics);
      if (coverPreview) fd.append("cover", coverPreview.file);
      const res = await fetch("/api/upload/audio", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error();
      const newAudio: Audio = await res.json();
      const updated = [
        ...audioList,
        { ...newAudio, position: audioList.length },
      ];
      setAudioList(updated);
      setCurrentConfig((prev) => ({ ...prev, audios: updated }));
      handleAudioBack();
    } catch {
      toast.error("Failed to upload audio. Try again.");
    } finally {
      setAudioUploading(false);
    }
  };

  const handleFindLyrics = async () => {
    const track = audioTitle.trim();
    const artist = audioArtist.trim();
    if (!track || !artist) return;

    setLyricsTriggered(true);
    setLyricsSearching(true);
    try {
      const params = new URLSearchParams({
        track_name: track,
        artist_name: artist,
      });

      const res = await fetch(`/api/lyrics?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error ?? "Lyrics not found.");
        return;
      }

      if (!data.syncedLyrics) {
        toast.error("No synced lyrics available for this track.");
        return;
      }

      // Auto-apply the match immediately — no manual selection step.
      setAudioLyrics(data.syncedLyrics);
      if (data.artist_name) {
        setAudioArtist(data.artist_name);
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLyricsSearching(false);
    }
  };

  const atBgLimit = bgList.length >= maxItems;
  const atAudioLimit = audioList.length >= maxItems;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Dialog
        onOpenChange={(open) => {
          if (!open) handleBgBack();
        }}
      >
        <DialogTrigger asChild>
          <div className="w-full border border-white/10 hover:border-white/20 h-24 flex flex-col gap-2 items-center justify-center bg-black/50 rounded-xl duration-300 cursor-pointer">
            <IconDeviceDesktopFilled
              size={30}
              className="text-muted-foreground"
            />
            <Label className="text-muted-foreground gap-1 text-sm cursor-pointer">
              Click to open
              <span className="font-bold text-primary">
                {" "}
                Background Manager
              </span>
            </Label>
          </div>
        </DialogTrigger>
        <DialogContent className="w-[500px] !max-w-none">
          {bgView === "manager" ? (
            <>
              <DialogTitle className="text-sm flex flex-row gap-1 items-center">
                <IconDeviceDesktopFilled />
                Background Manager
              </DialogTitle>
              <div className="h-40 overflow-y-auto">
                {bgList.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleBgDragEnd}
                  >
                    <SortableContext
                      items={bgList.map((b) => b.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-0.5">
                        {bgList.map((bg) => (
                          <SortableBackground
                            onDelete={handleBgDelete}
                            key={bg.id}
                            bg={bg}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="text-muted-foreground text-sm text-center h-full flex flex-col items-center justify-center gap-2">
                    <IconPhotoFilled size={50} />
                    No backgrounds uploaded yet
                  </div>
                )}
              </div>
              <div className="flex flex-row justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    defaultChecked={config.background_shuffle ?? false}
                    onCheckedChange={(checked) =>
                      update({ background_shuffle: checked === true })
                    }
                    id="shuffle-backgrounds"
                  />
                  <Label htmlFor="shuffle-backgrounds">
                    Shuffle Backgrounds
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    defaultChecked={config.background_mute ?? false}
                    onCheckedChange={(checked) =>
                      update({ background_mute: checked === true })
                    }
                    id="mute-bg"
                  />
                  <Label htmlFor="mute-bg">Mute Background</Label>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  disabled={atBgLimit}
                  size="lg"
                  onClick={() => setBgView("uploader")}
                >
                  <IconPhotoFilled />
                  Add Background
                </Button>
                {atBgLimit && !premium && (
                  <p className="text-xs text-muted-foreground text-center">
                    Free plan allows 1 background.{" "}
                    <span className="text-primary cursor-pointer hover:underline">
                      Upgrade to Premium
                    </span>{" "}
                    for up to 3.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <DialogTitle className="text-sm flex flex-row gap-2 items-center">
                <button
                  onClick={handleBgBack}
                  className="hover:text-primary transition-colors"
                >
                  <IconArrowLeft size={18} />
                </button>
                Upload Background
              </DialogTitle>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <Label className="text-sm">File</Label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setBgDragging(true);
                    }}
                    onDragLeave={() => setBgDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setBgDragging(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleBgFile(f);
                    }}
                    onClick={() =>
                      !bgPreview && bgFileInputRef.current?.click()
                    }
                    className={[
                      "relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl h-40 transition-colors duration-200",
                      bgPreview ? "cursor-default" : "cursor-pointer",
                      bgDragging
                        ? "border-primary bg-primary/10"
                        : "border-white/20 hover:border-white/40 bg-black/30 hover:bg-black/50",
                    ].join(" ")}
                  >
                    {bgPreview ? (
                      <>
                        {isVideoFile(bgPreview.name) ? (
                          <video
                            src={bgPreview.url}
                            className="w-full h-full object-cover rounded-xl"
                            muted
                            autoPlay
                            loop
                          />
                        ) : (
                          <img
                            src={bgPreview.url}
                            alt="preview"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        )}
                        <div className="absolute top-1.5 left-1.5 bg-black/60 rounded px-1 py-0.5 text-xs text-white/70">
                          {isVideoFile(bgPreview.name) ? "video" : "image"}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearBgPreview();
                          }}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full p-1 transition-colors"
                        >
                          <IconX size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <IconUpload
                          size={28}
                          className="text-muted-foreground"
                        />
                        <p className="text-sm text-muted-foreground text-center">
                          Drag & drop or{" "}
                          <span className="text-primary font-semibold">
                            browse
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          PNG, JPG, WEBP, GIF, MP4, WEBM supported
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Title</Label>
                  <Input
                    value={bgTitle}
                    onChange={(e) => setBgTitle(e.target.value)}
                  />
                </div>
              </div>
              <input
                ref={bgFileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleBgFile(f);
                  e.target.value = "";
                }}
              />
              <Button
                className="w-full"
                disabled={!bgPreview || !bgTitle.trim() || bgUploading}
                onClick={handleBgConfirm}
              >
                {bgUploading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <IconCloudUpload />
                )}
                {bgUploading ? "Uploading…" : "Add"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        onOpenChange={(open) => {
          if (!open) handleAudioBack();
        }}
      >
        <DialogTrigger asChild>
          <div className="w-full border border-white/10 hover:border-white/20 h-24 flex flex-col gap-2 items-center justify-center bg-black/50 rounded-xl duration-300 cursor-pointer">
            <IconDeviceAirpods size={30} className="text-muted-foreground" />
            <Label className="text-muted-foreground gap-1 text-sm cursor-pointer">
              Click to open
              <span className="font-bold text-primary"> Audio Manager</span>
            </Label>
          </div>
        </DialogTrigger>
        <DialogContent className="w-[500px] !max-w-none">
          {audioView === "manager" ? (
            <>
              <DialogTitle className="text-sm flex flex-row gap-1 items-center">
                <IconDeviceAirpods />
                Audio Manager
              </DialogTitle>
              <div className="h-40 overflow-y-auto">
                {audioList.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleAudioDragEnd}
                  >
                    <SortableContext
                      items={audioList.map((a) => a.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-0.5">
                        {audioList.map((audio) => (
                          <SortableAudio
                            onDelete={handleAudioDelete}
                            key={audio.id}
                            audio={audio}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="text-muted-foreground text-sm text-center h-full flex flex-col items-center justify-center gap-2">
                    <IconDeviceAirpods size={50} />
                    No audio uploaded yet
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  disabled={atAudioLimit}
                  size="lg"
                  onClick={() => setAudioView("uploader")}
                >
                  <IconMusic />
                  Add Audio
                </Button>
                {atAudioLimit && !premium && (
                  <p className="text-xs text-muted-foreground text-center">
                    Free plan allows 1 audio track.{" "}
                    <span className="text-primary cursor-pointer hover:underline">
                      Upgrade to Premium
                    </span>{" "}
                    for up to 3.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <DialogTitle className="text-sm flex flex-row gap-2 items-center">
                <button
                  onClick={handleAudioBack}
                  className="hover:text-primary transition-colors"
                >
                  <IconArrowLeft size={18} />
                </button>
                Upload Audio
              </DialogTitle>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-3">
                    <Label className="text-sm">File</Label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setAudioDragging(true);
                      }}
                      onDragLeave={() => setAudioDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setAudioDragging(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) handleAudioFile(f);
                      }}
                      onClick={() =>
                        !audioPreview && audioFileInputRef.current?.click()
                      }
                      className={[
                        "relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl h-28 transition-colors duration-200 px-3",
                        audioPreview ? "cursor-default" : "cursor-pointer",
                        audioDragging
                          ? "border-primary bg-primary/10"
                          : "border-white/20 hover:border-white/40 bg-black/30 hover:bg-black/50",
                      ].join(" ")}
                    >
                      {audioPreview ? (
                        <>
                          <div className="w-full h-full rounded-xl flex items-center justify-center">
                            <IconMusic size={30} className="text-primary" />
                          </div>
                          <div className="absolute top-1.5 left-1.5 bg-black/60 rounded px-1 py-0.5 text-xs text-white/70 uppercase">
                            .{getFileExtension(audioPreview.name)}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearAudioPreview();
                            }}
                            className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 rounded-full p-1 transition-colors"
                          >
                            <IconX size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <IconUpload
                            size={24}
                            className="text-muted-foreground"
                          />
                          <p className="text-xs text-muted-foreground text-center">
                            Drag & drop or{" "}
                            <span className="text-primary font-semibold">
                              browse
                            </span>
                          </p>
                          <p className="text-[11px] text-muted-foreground/60">
                            MP3, WAV, OGG
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label className="text-sm">Cover </Label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setCoverDragging(true);
                      }}
                      onDragLeave={() => setCoverDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setCoverDragging(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) handleCoverFile(f);
                      }}
                      onClick={() =>
                        !coverPreview && coverFileInputRef.current?.click()
                      }
                      className={[
                        "relative flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-xl h-28 transition-colors duration-200 overflow-hidden",
                        coverPreview ? "cursor-default" : "cursor-pointer",
                        coverDragging
                          ? "border-primary bg-primary/10"
                          : "border-white/20 hover:border-white/40 bg-black/30 hover:bg-black/50",
                      ].join(" ")}
                    >
                      {coverPreview ? (
                        <>
                          <img
                            src={coverPreview.url}
                            alt="cover preview"
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <div className="absolute top-1.5 left-1.5 bg-black/60 rounded px-1 py-0.5 text-xs text-white/70 uppercase">
                            .{getFileExtension(coverPreview.file.name)}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (coverPreview)
                                URL.revokeObjectURL(coverPreview.url);
                              setCoverPreview(null);
                            }}
                            className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 rounded-full p-1 transition-colors"
                          >
                            <IconX size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <IconPhotoFilled
                            size={22}
                            className="text-muted-foreground/60"
                          />
                          <p className="text-[11px] text-muted-foreground/60 text-center px-1">
                            Add cover art
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Title</Label>
                  <Input
                    value={audioTitle}
                    onChange={(e) => {
                      setAudioTitle(e.target.value);
                      if (lyricsTriggered) {
                        setLyricsTriggered(false);
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Artist</Label>
                  <Input
                    value={audioArtist}
                    onChange={(e) => {
                      setAudioArtist(e.target.value);
                      if (lyricsTriggered) {
                        setLyricsTriggered(false);
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row justify-between items-center">
                    <Label>Synced Lyrics</Label>
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full"
                      disabled={
                        !audioTitle.trim() ||
                        !audioArtist.trim() ||
                        lyricsSearching
                      }
                      onClick={handleFindLyrics}
                    >
                      {lyricsSearching ? (
                        <FaSpinner className="animate-spin" size={14} />
                      ) : (
                        <IconFileTextFilled size={14} />
                      )}
                      {lyricsSearching ? "Searching…" : "Find lyrics"}
                    </Button>
                  </div>
                  <Textarea
                    value={audioLyrics}
                    onChange={(e) => setAudioLyrics(e.target.value)}
                    placeholder="
                        [MM:SS.XX]
                        [MM:SS.XX]
                      "
                    className="h-24 resize-none border-white/10 py-2 focus-visible:border-white/50 focus-visible:ring-0"
                  />
                </div>
              </div>
              <input
                ref={audioFileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAudioFile(f);
                  e.target.value = "";
                }}
              />
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleCoverFile(f);
                  e.target.value = "";
                }}
              />
              <Button
                className="w-full"
                disabled={
                  !audioPreview ||
                  !audioTitle.trim() ||
                  !audioArtist.trim() ||
                  audioUploading
                }
                onClick={handleAudioConfirm}
              >
                {audioUploading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <IconCloudUpload />
                )}
                {audioUploading ? "Uploading…" : "Add"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
