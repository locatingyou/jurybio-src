"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ColorPicker } from "../_components/ColorPicker";
import { getIcon, getColor, BADGE_CONFIG } from "@/lib/badges";
import { useSaveBar } from "@/lib/stores/save-bar";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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
  IconBadgeFilled,
  IconDotsVertical,
  IconEditFilled,
  IconGripVertical,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaTrophy } from "react-icons/fa";
import { RiMistLine } from "react-icons/ri";
import { Slider } from "@/components/ui/slider";
import { Config } from "@/lib/types/profile";

type Badge = {
  id: string;
  name: string | null;
  icon: string | null;
  icon_url: string | null;
  icon_color: string;
  position: number;
  enabled: boolean;
};

const withPositions = (badges: Badge[]): Badge[] =>
  badges.map((b, index) => ({ ...b, position: index }));

// Maps Badge[] -> the shape configSchema.badges expects
const toConfigBadges = (badges: Badge[]) =>
  badges.map(({ id, icon_color, position, enabled, name, icon, icon_url }) => ({
    id,
    name,
    icon,
    icon_url,
    icon_color,
    position,
    enabled,
  }));

export function BadgeIcon({
  id,
  color,
  size = 28,
}: {
  id: string;
  color: string;
  size?: number;
}) {
  const Icon = getIcon(id);
  if (id === "champion") {
    return (
      <div className="flex flex-col items-center">
        <RiMistLine size={14} style={{ color }} className="-mb-1" />
        <FaTrophy size={24} style={{ color }} />
      </div>
    );
  }
  if (!Icon) return null;
  return <Icon style={{ color }} size={size} />;
}

function SortableBadges({
  badge,
  onToggleEnabled,
  onSettings,
}: {
  badge: Badge;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onSettings: (badge: Badge) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: badge.id });

  const config = BADGE_CONFIG[badge.icon ?? ""];
  const color = badge.icon_color || getColor(badge.icon ?? "");

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : badge.enabled ? 1 : 0.5,
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
        <div className="shrink-0 flex items-center justify-center w-6 ml-1">
          {badge.icon && <BadgeIcon id={badge.icon} color={color} size={20} />}
        </div>
        <div className="flex flex-col ml-2">
          <span className="text-sm font-medium">
            {config?.name ?? badge.name}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={badge.enabled}
          onCheckedChange={(checked) => onToggleEnabled(badge.id, checked)}
          aria-label={badge.enabled ? "Hide badge" : "Show badge"}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="shrink-0 rounded-md p-1.5 text-white/40 transition-colors hover:text-white">
              <IconDotsVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onSettings(badge)}>
                <IconEditFilled /> Edit Badge
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function BadgeSettingsDialog({
  badge,
  open,
  onOpenChange,
  onSaved,
}: {
  badge: Badge | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: (updated: Badge) => void;
}) {
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    if (badge) setColor(badge.icon_color || getColor(badge.icon ?? ""));
  }, [badge]);

  if (!badge) return null;
  const config = BADGE_CONFIG[badge.icon ?? ""];

  function handleDone() {
    if (!badge) return;
    onSaved({ ...badge, icon_color: color });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{badge.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs">Badge Color</Label>
            <ColorPicker color={color} onChange={setColor} />
          </div>
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center justify-center w-14 h-14 rounded-full border border-white/10 bg-[#0d0d0d]">
              {badge.icon && (
                <BadgeIcon id={badge.icon} color={color} size={32} />
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="bg-transparent border-transparent px-4 pt-2 pb-5">
          <Button onClick={handleDone}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BadgeEditor({
  config,
  badges,
}: {
  config: Config;
  badges: Badge[];
}) {
  const { update } = useSaveBar();
  const [sortedBadges, setSortedBadges] = useState<Badge[]>(() =>
    withPositions(
      [...badges].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    ),
  );
  const [settingsBadge, setSettingsBadge] = useState<Badge | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      const activeIndex = sortedBadges.findIndex((l) => l.id === active.id);
      const overIndex = sortedBadges.findIndex((l) => l.id === over.id);
      const newOrder = withPositions(
        arrayMove(sortedBadges, activeIndex, overIndex),
      );
      setSortedBadges(newOrder);
      update({ badges: toConfigBadges(newOrder) });
    }
  };

  function handleToggleEnabled(id: string, enabled: boolean) {
    const next = sortedBadges.map((b) => (b.id === id ? { ...b, enabled } : b));
    setSortedBadges(next);
    update({ badges: toConfigBadges(next) });
  }

  function openSettings(badge: Badge) {
    setSettingsBadge(badge);
    setSettingsOpen(true);
  }

  function handleSettingsSaved(updated: Badge) {
    const next = sortedBadges.map((b) => (b.id === updated.id ? updated : b));
    setSortedBadges(next);
    update({ badges: toConfigBadges(next) });
  }

  return (
    <>
      <div className="flex flex-col">
        <Label className="text-lg font-semibold">Badges Settings</Label>
        <Label className="text-base text-foreground/50 font-normal">
          Customize how badges look on your profile
        </Label>
        <div className="h-54 w-full flex flex-col items-center justify-center gap-2 rounded-3xl border border-foreground/10 bg-input/20 px-6 py-4 mt-4">
          <div className="grid gap-3 md:grid-cols-3 w-full">
            <div className="flex flex-col">
              <Label className="text-sm">Glow</Label>
              <Label className="text-sm text-foreground/70 font-normal">
                Add a soft Glow to your badges.
              </Label>
              <Switch
                checked={config.badge_glow}
                onCheckedChange={(v) => update({ badge_glow: v })}
                className="mt-4"
              />
            </div>
            <div className="flex flex-col">
              <Label className="text-sm">Monochrome Color</Label>
              <Label className="text-sm text-foreground/70 font-normal">
                Render all badges in one color.
              </Label>
              <Switch
                checked={config.badge_monochrome}
                onCheckedChange={(v) => update({ badge_monochrome: v })}
                className="mt-4"
              />
            </div>
            <div className="flex flex-col gap-6">
              <Label className="text-sm">Badge Color</Label>
              <ColorPicker
                type="hex"
                color={config.badge_color}
                onChange={(color) => update({ badge_color: color })}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 w-full mb-3">
            <div className="flex flex-col gap-6">
              <div className="flex w-full justify-between items-center flex-row">
                <Label className="text-base">Badge Size</Label>
                <Label className="text-xs text-foreground/60 font-normal">
                  {config.badge_size}
                </Label>
              </div>
              <Slider
                value={[config.badge_size]}
                onValueChange={([v]) => update({ badge_size: v })}
                min={0}
                max={100}
              />
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex w-full justify-between items-center flex-row">
                <Label className="text-base">Glow Strength</Label>
                <Label className="text-xs text-foreground/60 font-normal">
                  {config.badge_glow_strength}
                </Label>
              </div>
              <Slider
                value={[config.badge_glow_strength]}
                onValueChange={([v]) => update({ badge_glow_strength: v })}
                min={0}
                max={100}
                step={10}
              />
            </div>
          </div>
        </div>
        <div className="h-auto w-full flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-foreground/10 bg-input/20 px-6 py-4 mt-4">
          {sortedBadges.length === 0 ? (
            <div className="h-72 flex items-center justify-center flex-col gap-2">
              <IconBadgeFilled className="h-14 w-14 text-foreground" />
              <Label className="text-base">No badges yet.</Label>
              <Label className="text-muted-foreground text-sm">
                Earn badges or purchase a custom badge to add your own.
              </Label>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedBadges.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="w-full flex flex-col gap-3">
                  {sortedBadges.map((badge) => (
                    <SortableBadges
                      key={badge.id}
                      badge={badge}
                      onToggleEnabled={handleToggleEnabled}
                      onSettings={openSettings}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <BadgeSettingsDialog
            badge={settingsBadge}
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            onSaved={handleSettingsSaved}
          />
        </div>
      </div>
    </>
  );
}
