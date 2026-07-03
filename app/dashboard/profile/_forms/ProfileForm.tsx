"use client";
import { Label } from "@/components/ui/label";
import RichTextEditor from "../_components/RichTextEditor";
import {
  IconUser,
  IconMapPin,
  IconAspectRatioFilled,
  IconTextRecognition,
  IconWorld,
  IconLock,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { BsLayoutSplit } from "react-icons/bs";
import { RxBox } from "react-icons/rx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AvatarBannerUploader from "../_components/AvatarBannerUploader";
import BackgroundAudioManager from "../_components/BackgroundAudioManagers";
import { Config } from "@/lib/types/profile";
import { useSaveBar, configAtom } from "@/lib/stores/save-bar";
import { useAtom } from "jotai";

export default function ProfileForm({
  premium,
  username,
  config,
}: {
  premium: boolean;
  username: string;
  config: Partial<Config>;
}) {
  const [local, setLocal] = useState(config);
  const { update } = useSaveBar();
  const [, setConfig] = useAtom(configAtom);
  const uploadFields = new Set(["avatar_url", "banner_url"]);

  const handleChange = (patch: Partial<Config>) => {
    setLocal((prev) => ({ ...prev, ...patch }));
    const nonUploadPatch = Object.fromEntries(
      Object.entries(patch).filter(([key]) => !uploadFields.has(key)),
    );
    if (Object.keys(nonUploadPatch).length > 0) {
      update(patch);
    } else {
      setConfig((prev) => ({ ...prev, ...patch }));
    }
  };

  const animations = [
    { icon: BsLayoutSplit, name: "Split" },
    { icon: RxBox, name: "Normal" },
  ];

  return (
    <>
      <AvatarBannerUploader
        avatar={{
          value: local.avatar_url ?? null,
          decoration: local.avatar_decoration,
          onDecorationChange: (decoration) =>
            handleChange({ avatar_decoration: decoration ?? "" }),
          onShapeChange: (shape) => handleChange({ avatar_shape: shape }),
          onChange: (url) => handleChange({ avatar_url: url ?? "" }),
          shape: local.avatar_shape,
        }}
        banner={{
          value: local.banner_url ?? null,
          onChange: (url) => handleChange({ banner_url: url ?? "" }),
        }}
      />
      <Separator />
      <BackgroundAudioManager
        backgrounds={local.backgrounds ?? null}
        premium={premium}
        onReorder={(backgrounds) => handleChange({ backgrounds })}
        onAudioReorder={(audios) => handleChange({ audios })}
        audios={local.audios ?? null}
        config={{
          background_mute: local.background_mute ?? false,
          background_shuffle: local.background_shuffle ?? false,
        }}
      />
      <Separator />
      <div className="flex flex-col gap-2">
        <Label className="text-[16px]">Description</Label>
        <RichTextEditor
          value={local.description ?? ""}
          onChange={(html) => handleChange({ description: html })}
        />
        <Separator className="mt-4" />
        <div className="grid grid-rows-2 md:grid-rows-1 grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label className="text-[16px]">Display Name</Label>
            <InputGroup className="py-4.5 px-1">
              <InputGroupAddon>
                <IconUser size={16} />
              </InputGroupAddon>
              <InputGroupInput
                className="ml-0 !pl-2 text-white"
                value={local.display_name ?? ""}
                onChange={(e) => handleChange({ display_name: e.target.value })}
              />
            </InputGroup>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[16px]">Location</Label>
            <InputGroup className="py-4.5 px-1">
              <InputGroupAddon>
                <IconMapPin size={16} />
              </InputGroupAddon>
              <InputGroupInput
                className="ml-0 !pl-2 text-white"
                value={local.location ?? ""}
                onChange={(e) => handleChange({ location: e.target.value })}
              />
            </InputGroup>
          </div>
        </div>
        <Separator className="my-4" />
        <Card>
          <CardHeader className="flex flex-row gap-1 items-center justify-between text-muted-foreground">
            <div className="flex flex-row items-center gap-1">
              <IconAspectRatioFilled size={20} />
              <Label className="text-base">Entry Screen</Label>
            </div>
            <Switch
              checked={local.entry_enabled}
              onCheckedChange={(v) => handleChange({ entry_enabled: v })}
            />
          </CardHeader>
          {local.entry_enabled && (
            <CardContent className="grid grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Text</Label>
                <InputGroup>
                  <InputGroupInput
                    onChange={(e) =>
                      handleChange({ entry_text: e.target.value })
                    }
                    value={local.entry_text ?? ""}
                    placeholder="enter"
                  />
                  <InputGroupAddon>
                    <IconTextRecognition />
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Animation</Label>
                <Select
                  onValueChange={(e) =>
                    handleChange({ entry_animation: e as "Normal" | "Split" })
                  }
                  value={local.entry_animation}
                >
                  <SelectTrigger className="!py-0 !h-8 w-full !rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {animations.map(({ icon: Icon, name }) => (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center gap-2">
                            <Icon size={14} />
                            <span>{name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          )}
        </Card>
        <Separator className="my-4" />
        <Card className="relative overflow-hidden bg-zinc-900/40 border-zinc-800">
          <CardHeader className="flex flex-row gap-1 items-center justify-between text-muted-foreground">
            <div className="flex flex-row items-center gap-1">
              <IconWorld size={20} className="text-zinc-400" />
              <Label className="text-base text-zinc-200">Page Metadata (SEO)</Label>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {premium ? (
              <>
                <div className="flex flex-col gap-4 border-b border-zinc-800 pb-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="meta_title" className="text-sm font-medium text-zinc-300">Meta Title</Label>
                      <span className="text-[10px] text-zinc-500">Default: {"{username}"}</span>
                    </div>
                    <InputGroup>
                      <InputGroupInput
                        id="meta_title"
                        onChange={(e) =>
                          handleChange({ meta_title: e.target.value })
                        }
                        value={local.meta_title ?? ""}
                        placeholder="e.g., {username} | My Custom Title"
                        className="text-white placeholder:text-zinc-500"
                      />
                    </InputGroup>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="meta_description" className="text-sm font-medium text-zinc-300">Meta Description</Label>
                      <span className="text-[10px] text-zinc-500">Default: {"{description}"}</span>
                    </div>
                    <InputGroup>
                      <InputGroupInput
                        id="meta_description"
                        onChange={(e) =>
                          handleChange({ meta_description: e.target.value })
                        }
                        value={local.meta_description ?? ""}
                        placeholder="e.g., Check out my biolink: {description}"
                        className="text-white placeholder:text-zinc-500"
                      />
                    </InputGroup>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Available variables: <code className="bg-zinc-850 text-zinc-300 px-1.5 py-0.5 rounded">{"{username}"}</code>, <code className="bg-zinc-850 text-zinc-300 px-1.5 py-0.5 rounded">{"{description}"}</code>
                  </div>
                </div>
              </>
            ) : null}

            {/* Live Metadata Previews */}
            <div className="flex flex-col gap-4">
              <Label className="text-xs uppercase font-semibold text-zinc-500 tracking-wider">Live Preview</Label>
              
              {/* Google Search Snippet */}
              <div className="border border-zinc-800 bg-zinc-950/40 rounded-lg p-4 flex flex-col gap-2">
                <span className="text-[9px] uppercase font-semibold text-zinc-500 tracking-wider">Search Engine Snippet</span>
                <div className="flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span className="bg-zinc-850 px-1 py-0.2 rounded text-[10px] text-zinc-400 font-mono">jury.lat</span>
                    <span>jury.lat/{username}</span>
                  </div>
                  <span className="text-[17px] font-medium text-blue-400 hover:underline cursor-pointer leading-snug">
                    {(() => {
                      const rawDesc = local.description ? stripHtml(local.description) : "";
                      const template = premium ? (local.meta_title || "{username}") : "{username}";
                      return formatMetadataText(template, username, rawDesc) || username;
                    })()}
                  </span>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {(() => {
                      const rawDesc = local.description ? stripHtml(local.description) : "";
                      const template = premium ? (local.meta_description || "{description}") : "{description}";
                      return formatMetadataText(template, username, rawDesc) || "No description set.";
                    })()}
                  </p>
                </div>
              </div>

              {/* Discord Embed style */}
              <div className="border border-zinc-800 bg-zinc-950/40 rounded-lg p-4 flex flex-col gap-2">
                <span className="text-[9px] uppercase font-semibold text-zinc-500 tracking-wider">Social Share Card</span>
                <div className="flex border-l-[4px] border-[#5865F2] bg-[#2b2d31] rounded p-3 gap-3 text-left">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Jury</span>
                    <span className="text-sm font-bold text-white leading-tight">
                      {(() => {
                        const rawDesc = local.description ? stripHtml(local.description) : "";
                        const template = premium ? (local.meta_title || "{username}") : "{username}";
                        return formatMetadataText(template, username, rawDesc) || username;
                      })()}
                    </span>
                    <p className="text-xs text-[#dbdee1] leading-snug mt-1 line-clamp-3 whitespace-pre-wrap">
                      {(() => {
                        const rawDesc = local.description ? stripHtml(local.description) : "";
                        const template = premium ? (local.meta_description || "{description}") : "{description}";
                        return formatMetadataText(template, username, rawDesc) || "No description set.";
                      })()}
                    </p>
                  </div>
                  {local.avatar_url && (
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-zinc-800 relative self-center border border-zinc-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={local.avatar_url}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!premium && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mt-1">
                <div className="flex items-center gap-2">
                  <IconLock size={16} className="text-amber-500 flex-shrink-0" />
                  <span className="text-xs text-amber-200">Unlock custom SEO configurations with Premium.</span>
                </div>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">Upgrade</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function formatMetadataText(template: string, username: string, description: string): string {
  return template
    .replace(/{username}/g, username)
    .replace(/{description}/g, description);
}
