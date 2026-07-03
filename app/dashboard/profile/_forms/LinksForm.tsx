import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconDotsVertical,
  IconEdit,
  IconEditFilled,
  IconGripVertical,
  IconLoader2,
  IconPlus,
  IconTrashFilled,
} from "@tabler/icons-react";
import { PLATFORM_CONFIG, getIcon, getColor } from "@/lib/links";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useEffect, useState } from "react";
import { ColorPicker } from "../_components/ColorPicker";
import { FaGlobe } from "react-icons/fa6";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSaveBar } from "@/lib/stores/save-bar";

export interface Link {
  id: string;
  icon: string;
  url: string;
  type?: string;
  enabled: boolean;
  color?: string;
  position: number;
}

const PLATFORMS = Object.keys(PLATFORM_CONFIG).sort();
const CLIPBOARD_PLATFORMS = ["Bitcoin", "Ethereum", "Monero", "custom"];
const DEFAULT_PLATFORM = "custom";
const DEFAULT_COLOR = "#FFFFFF";

const isCopyToClipboard = (platform: string) => {
  return CLIPBOARD_PLATFORMS.includes(platform);
};

const getPrefix = (platform: string) => {
  if (isCopyToClipboard(platform)) return "";
  return PLATFORM_CONFIG[platform]?.prefix || "";
};

const getInputLabel = (platform: string) => {
  if (platform === "custom") return "URL";
  if (isCopyToClipboard(platform)) return "Wallet Address";
  return "Identifier";
};

const getPlaceholder = (platform: string) => {
  if (platform === "custom") return "Paste your URL";
  if (isCopyToClipboard(platform)) return "Paste your wallet address";
  return "...";
};

const stripPrefix = (platform: string, url: string) => {
  const prefix = getPrefix(platform);
  if (prefix && url.startsWith(prefix)) {
    return url.slice(prefix.length);
  }
  return url;
};

const withPositions = (links: Link[]): Link[] =>
  links.map((l, index) => ({ ...l, position: index }));

function SortableLinksRow({
  link,
  onEdit,
  onDelete,
  onToggleVisibility,
}: {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, enabled: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const Icon = getIcon(link.icon);
  const linkColor = link.color || getColor(link.icon);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : link.enabled ? 1 : 0.5,
      }}
      className="flex items-center justify-between p-3 rounded-lg bg-background border border-foreground/10 hover:border-foreground/20 transition-colors"
    >
      <div className="flex items-center gap-1">
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab rounded-md p-1.5 text-white/40 transition-colors hover:text-white active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <IconGripVertical className="h-4 w-4" />
        </button>
        {Icon && <Icon size={20} style={{ color: linkColor }} />}
        <div className="flex flex-col ml-2">
          <span className="text-sm font-medium capitalize">
            {link.icon === "custom" ? "Custom" : link.icon}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-xs">
            {link.url}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={link.enabled}
          onCheckedChange={(checked) => onToggleVisibility(link.id, checked)}
          aria-label={link.enabled ? "Hide link" : "Show link"}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="shrink-0 rounded-md p-1.5 text-white/40 transition-colors hover:text-white">
              <IconDotsVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onEdit(link)}>
                <IconEditFilled /> Edit Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(link.id)}
                variant="destructive"
              >
                <IconTrashFilled /> Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function LinkDialog({
  mode,
  open,
  onOpenChange,
  initialLink,
  trigger,
  onSubmit,
}: {
  mode: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLink?: Link;
  trigger?: React.ReactNode;
  onSubmit: (
    link: Omit<Link, "id" | "position"> & { id?: string },
  ) => Promise<void>;
}) {
  const [platform, setPlatform] = useState<string>(
    initialLink?.icon || DEFAULT_PLATFORM,
  );
  const [color, setColor] = useState<string>(
    initialLink?.color ||
      getColor(initialLink?.icon || DEFAULT_PLATFORM) ||
      DEFAULT_COLOR,
  );
  const [value, setValue] = useState<string>(
    initialLink ? stripPrefix(initialLink.icon, initialLink.url) : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPlatform(initialLink?.icon || DEFAULT_PLATFORM);
      setColor(
        initialLink?.color ||
          getColor(initialLink?.icon || DEFAULT_PLATFORM) ||
          DEFAULT_COLOR,
      );
      setValue(
        initialLink ? stripPrefix(initialLink.icon, initialLink.url) : "",
      );
      setError(null);
    }
  }, [open, initialLink]);

  const handlePlatformChange = (next: string) => {
    setPlatform(next);
    // only reset color to the platform default when adding a new link;
    // when editing, keep whatever color the user already had/picked
    if (mode === "add") {
      setColor(getColor(next) || DEFAULT_COLOR);
    }
  };

  const handleSubmit = async () => {
    if (!value.trim() || submitting) return;

    const url = `${getPrefix(platform)}${value.trim()}`;
    setError(null);
    setSubmitting(true);

    try {
      await onSubmit({
        id: initialLink?.id,
        icon: platform,
        url,
        color,
        enabled: initialLink?.enabled ?? true,
        type: initialLink?.type,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Link" : "Add Link"}
          </DialogTitle>
          <DialogDescription className="max-w-xs">
            Pick a platform, choose a color, and enter your identifier.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Label>Platform</Label>
          <Select value={platform} onValueChange={handlePlatformChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="max-h-60 overflow-y-auto !mt-0"
            >
              <SelectGroup>
                {PLATFORMS.map((p) => {
                  const Icon = getIcon(p);
                  const label =
                    p === "custom"
                      ? "Custom"
                      : p === "AppleMusic"
                        ? "Apple Music"
                        : p.charAt(0).toUpperCase() + p.slice(1);
                  return (
                    <SelectItem key={p} value={p}>
                      <span className="flex items-center gap-2 transition-colors duration-500">
                        {Icon && (
                          <Icon
                            size={16}
                            style={{ color: getColor(p) }}
                            className="opacity-80 hover:opacity-100 transition-opacity duration-300"
                          />
                        )}
                        <span>{label}</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-4">
          <Label>{getInputLabel(platform)}</Label>
          <InputGroup className="py-4.5 rounded-3xl">
            {platform && (
              <InputGroupAddon>
                <div className="flex items-center gap-2 ml-2">
                  {(() => {
                    const Icon = getIcon(platform);
                    return Icon ? <Icon size={18} style={{ color }} /> : null;
                  })()}
                  {getPrefix(platform) && <p>{getPrefix(platform)}</p>}
                </div>
              </InputGroupAddon>
            )}
            <InputGroupInput
              className="pl-0"
              placeholder={getPlaceholder(platform)}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="flex flex-col gap-4">
          <Label>Icon Color</Label>
          <ColorPicker type="hex" color={color} onChange={setColor} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={handleSubmit} disabled={!value.trim() || submitting}>
          {submitting ? <IconLoader2 className="animate-spin" /> : <IconPlus />}
          {submitting
            ? mode === "edit"
              ? "Saving..."
              : "Adding..."
            : mode === "edit"
              ? "Save Changes"
              : "Add Link"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function LinksForm({ links }: { links: Link[] }) {
  const { update } = useSaveBar();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [sortedLinks, setSortedLinks] = useState<Link[]>(() =>
    withPositions(
      [...links].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    ),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIndex = sortedLinks.findIndex((l) => l.id === active.id);
      const overIndex = sortedLinks.findIndex((l) => l.id === over.id);

      const newOrder = withPositions(
        arrayMove(sortedLinks, activeIndex, overIndex),
      );
      setSortedLinks(newOrder);
      update({ links: newOrder });
    }
  };

  const handleAddSubmit = async (
    link: Omit<Link, "id" | "position"> & { id?: string },
  ) => {
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: link.icon,
        url: link.url,
        type: link.type,
        enabled: link.enabled,
        color: link.color,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data?.error === "string"
          ? data.error
          : Object.values(data?.error ?? {})
              .flat()
              .join(", ") || "Couldn't add link";
      throw new Error(message);
    }

    const created: Link = {
      id: data.link.id,
      icon: data.link.icon,
      url: data.link.url,
      color: data.link.color ?? link.color,
      enabled: data.link.enabled,
      type: data.link.type,
      position: data.link.position,
    };

    setSortedLinks(withPositions([...sortedLinks, created]));
  };

  const handleEditSubmit = async (
    link: Omit<Link, "id" | "position"> & { id?: string },
  ) => {
    if (!link.id) return;

    const res = await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: link.id,
        icon: link.icon,
        url: link.url,
        color: link.color,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data?.error === "string"
          ? data.error
          : Object.values(data?.error ?? {})
              .flat()
              .join(", ") || "Couldn't save changes";
      throw new Error(message);
    }

    setSortedLinks((prev) =>
      withPositions(
        prev.map((l) =>
          l.id === link.id
            ? {
                ...l,
                icon: data.link.icon,
                url: data.link.url,
                // fall back to what we just submitted if the server
                // response doesn't echo the color back for some reason,
                // so the UI doesn't silently revert to the old color
                color: data.link.color ?? link.color,
              }
            : l,
        ),
      ),
    );
  };

  const handleDelete = async (id: string) => {
    const previous = sortedLinks;
    const newLinks = withPositions(
      sortedLinks.filter((link) => link.id !== id),
    );
    setSortedLinks(newLinks);

    try {
      const res = await fetch(`/api/links?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      setSortedLinks(previous);
    }
  };

  const handleToggleVisibility = (id: string, enabled: boolean) => {
    const newLinks = withPositions(
      sortedLinks.map((l) => (l.id === id ? { ...l, enabled } : l)),
    );
    setSortedLinks(newLinks);
    update({ links: newLinks });
  };

  return (
    <main className="flex flex-col gap-4">
      <div className="flex flex-col items-end gap-1.5">
        <LinkDialog
          mode="add"
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSubmit={handleAddSubmit}
          trigger={
            <Button
              className="flex items-center w-fit gap-1 px-4 text-sm"
              size={"lg"}
            >
              <IconEdit /> Add Link
            </Button>
          }
        />
      </div>
      {editingLink && (
        <LinkDialog
          mode="edit"
          open={!!editingLink}
          onOpenChange={(open) => {
            if (!open) setEditingLink(null);
          }}
          initialLink={editingLink}
          onSubmit={handleEditSubmit}
        />
      )}
      <div className="h-auto w-full flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-foreground/10 bg-input/20 px-6 py-4">
        {sortedLinks.length === 0 ? (
          <div className="h-72 flex items-center justify-center flex-col gap-2">
            <FaGlobe className="h-14 w-14 text-foreground" />
            <Label className="text-base">No widgets here yet</Label>
            <Label className="text-muted-foreground text-sm">
              No widgets added yet. Click &quot;Add Link&quot; to get started.
            </Label>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedLinks.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="w-full flex flex-col gap-3">
                {sortedLinks.map((link) => (
                  <SortableLinksRow
                    key={link.id}
                    link={link}
                    onEdit={setEditingLink}
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </main>
  );
}
