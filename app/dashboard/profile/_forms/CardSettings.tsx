"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { IconPaintFilled } from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import FontManager from "../_components/FontManager";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useSaveBar } from "@/lib/stores/save-bar";
import { Config } from "@/lib/types/profile";
import { ColorPicker } from "../_components/ColorPicker";
import { Separator } from "@/components/ui/separator";
import { FontFamilyEnum } from "@/lib/validation/zod";

export default function CardSettings({ config }: { config: Config }) {
  const { update } = useSaveBar();

  return (
    <Card>
      <CardHeader className="flex flex-row gap-1 items-center text-muted-foreground">
        <IconPaintFilled size={20} />
        <Label className="text-base">Card Settings</Label>
      </CardHeader>
      <CardContent className="grid grid-cols-6 gap-4">
        <div className="col-span-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-4 h-full w-full">
            <Label>Card</Label>
            <ColorPicker
              type="rgba"
              color={config.card_color}
              onChange={(v) => update({ card_color: v })}
            />
          </div>
          <div className="flex flex-col gap-4 h-full w-full">
            <Label>Text</Label>
            <ColorPicker
              type="hex"
              color={config.text_color}
              onChange={(v) => update({ text_color: v })}
            />
          </div>
          <div className="flex flex-col gap-4 h-full w-full">
            <Label>Username</Label>
            <ColorPicker
              type="hex"
              color={config.username_color}
              onChange={(v) => update({ username_color: v })}
            />
          </div>
          <div className="flex flex-col gap-4 h-full w-full">
            <Label>Border</Label>
            <ColorPicker
              type="rgba"
              color={config.border_color}
              onChange={(v) => update({ border_color: v })}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 h-full w-full col-span-6">
          <Label>Theme Color</Label>
          <ColorPicker
            type="hex"
            color={config.theme_color}
            onChange={(v) => update({ theme_color: v })}
          />
        </div>
        <Separator className="col-span-6" />
        <div className="col-span-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-4 h-full w-full">
            <Label>Secondary Card</Label>
            <ColorPicker
              type="rgba"
              color={config.secondary_card_color}
              onChange={(v) => update({ secondary_card_color: v })}
            />
          </div>
          <div className="flex flex-col gap-4 h-full w-full">
            <Label>Secondary Text</Label>
            <ColorPicker
              type="hex"
              color={config.secondary_text_color}
              onChange={(v) => update({ secondary_text_color: v })}
            />
          </div>
          <div className="flex flex-col gap-4 h-full w-full">
            <Label>Secondary Border</Label>
            <ColorPicker
              type="rgba"
              color={config.secondary_border_color}
              onChange={(v) => update({ secondary_border_color: v })}
            />
          </div>
        </div>
        <div className="col-span-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-base">Font Family</Label>
            <FontManager fonts={config.fonts || []} />
          </div>
          <Select
            defaultValue={config.font_family}
            onValueChange={(v) => update({ font_family: v })}
          >
            <SelectTrigger
              style={{ fontFamily: config.font_family }}
              className="w-full rounded-xl"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                {/* Standard Fonts */}
                {FontFamilyEnum.options.map((font) => (
                  <SelectItem
                    style={{ fontFamily: font }}
                    key={font}
                    value={font}
                  >
                    {font}
                  </SelectItem>
                ))}
                {/* Custom Fonts */}
                {config.fonts && config.fonts.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2 border-t border-white/5">
                      Custom Fonts
                    </div>
                    {config.fonts.map((font) => (
                      <SelectItem
                        style={{ fontFamily: font.title }}
                        key={font.id}
                        value={font.title}
                      >
                        {font.title}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-3 flex flex-col gap-2">
          <Label className="text-base">Border Radius</Label>
          <Select
            defaultValue={config.border_radius}
            onValueChange={(v) =>
              update({ border_radius: v as Config["border_radius"] })
            }
          >
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Small">Small</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Large">Large</SelectItem>
                <SelectItem value="XL">XL</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-base">Width</Label>
            <span className="text-xs text-muted-foreground">
              {config.card_width}px
            </span>
          </div>
          <Slider
            min={400}
            max={1500}
            step={10}
            value={[config.card_width ?? 500]}
            onValueChange={([v]) => update({ card_width: v })}
          />
        </div>

        <div className="col-span-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-base">Border Size</Label>
            <span className="text-xs text-muted-foreground">
              {config.card_border_size}px
            </span>
          </div>
          <Slider
            min={0}
            max={10}
            step={1}
            value={[config.card_border_size ?? 1]}
            onValueChange={([v]) => update({ card_border_size: v })}
          />
        </div>
        <div className="col-span-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-base">Card Blur</Label>
            <span className="text-xs text-muted-foreground">
              {config.card_blur}
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            value={[config.card_blur]}
            onValueChange={([v]) => update({ card_blur: v })}
          />
        </div>

        <div className="col-span-6 flex flex-row gap-8">
          {[
            // { label: "Glow", value: config.glow ?? false, key: "glow" },
            {
              label: "Tilt",
              value: config.card_tilt ?? false,
              key: "card_tilt",
            },
          ].map(({ label, value, key }) => (
            <div key={label} className="flex flex-col gap-2">
              <Label className="text-base">{label}</Label>
              <div className="h-10 flex items-center">
                <Switch
                  checked={value}
                  onCheckedChange={(v) => update({ [key]: v })}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
