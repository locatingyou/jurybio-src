import Username from "@/components/profile/components/username";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconEaseInControlPoint, IconReload } from "@tabler/icons-react";
import Image from "next/image";

const animationOptions = [
  "None",
  "Slide Up",
  "Slide Down",
  "Zoom In",
  "Zoom Out",
  "Bounce",
];
const animationOptionsWidget = ["None", "Fade In", "Slide Up", "Slide Down"];
const animationOptionsLinks = [
  "None",
  "Fade In",
  "Slide Up",
  "Slide Down",
  "Zoom In",
  "Zoom Out",
  "Bounce",
];

function AnimationGroup({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-[14px]">{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <Button key={opt} variant="outline" className="text-xs h-8">
            {opt}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function AnimationSettings({
  premium,
  username,
}: {
  premium: boolean;
  username: string;
  config: {
    card_animation: string;
    audio_player_animation: string;
  };
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-1/2 border-l border-white/10 hidden md:block">
        {/*<button
          className="absolute right-4 top-4 z-[999] border border-white/5 bg-black/5 backdrop-blur-md p-2 rounded-md flex justify-center items-center"
        >
          <IconReload size={15} />
        </button>*/}
        <Image
          src={"/background.jpg"}
          className="object-cover image"
          fill
          alt="wallpaper"
        />
        <div className="h-full w-full flex items-center justify-center">
          <div className="z-10 px-8 py-2 w-2/3 h-20 rounded-xl bg-white/5 backdrop-blur-md flex items-center justify-center">
            <Username
              username={username}
              text_color="#fffff"
              fontType="bold"
              username_effects={["Black Sparkles"]}
              uid={0}
            />
          </div>
        </div>
      </div>

      <CardHeader className="relative z-10 flex flex-row gap-1 items-center text-muted-foreground">
        <IconEaseInControlPoint size={20} />
        <Label className="text-base">Animation Settings</Label>
      </CardHeader>

      <CardContent className="relative z-10 grid grid-cols-1 md:grid-cols-2">
        <ScrollArea className="h-[280px] pr-4">
          <div className="flex flex-col gap-4 pb-2">
            <AnimationGroup
              label="Card Animations"
              options={animationOptions}
            />
            <AnimationGroup
              label="Widget Animations"
              options={animationOptionsWidget}
            />
            <AnimationGroup
              label="Link Animations"
              options={animationOptionsLinks}
            />
          </div>
        </ScrollArea>
        <div className="hidden md:block" />
      </CardContent>
    </Card>
  );
}
