"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { IconAppWindowFilled, IconPaintFilled } from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useSaveBar } from "@/lib/stores/save-bar";
import { Config } from "@/lib/types/profile";
import { ColorPicker } from "../_components/ColorPicker";
import { Separator } from "@/components/ui/separator";
import { FontFamilyEnum } from "@/lib/validation/zod";

export default function PageSettings({ config }: { config: Config }) {
  const { update } = useSaveBar();

  return (
    <Card>
      <CardHeader className="flex flex-row gap-1 items-center text-muted-foreground">
        <IconAppWindowFilled size={20} />
        <Label className="text-base">Page Settings</Label>
      </CardHeader>
      <CardContent className="grid grid-cols-6 gap-4 mb-5">
        <div className="col-span-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-4 h-full w-full col-span-4">
            <Label>Background</Label>
            <ColorPicker
              type="hex"
              color={config.background_color}
              onChange={(v) => update({ background_color: v })}
            />
          </div>
        </div>
        <Separator className="col-span-6" />
        <div className="col-span-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-base">Background Blur</Label>
            <span className="text-xs text-muted-foreground">
              {config.background_blur}px
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            value={[config.background_blur]}
            onValueChange={([v]) => update({ background_blur: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
