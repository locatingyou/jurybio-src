"use client";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Toggle } from "@/components/ui/toggle";
import * as i from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ChainedCommands } from "@tiptap/core";
import type { ComponentType, SVGProps } from "react";
import { useState, useEffect } from "react";

const TOOLBAR_CONFIG: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  action: (e: ChainedCommands) => ChainedCommands;
  activeKey?: string;
  activeAttr?: Record<string, unknown>;
  undoRedo?: "undo" | "redo";
  title: string;
}[] = [
  {
    icon: i.IconH1,
    action: (e) => e.toggleHeading({ level: 1 }),
    activeKey: "heading",
    activeAttr: { level: 1 },
    title: "Heading 1",
  },
  {
    icon: i.IconH2,
    action: (e) => e.toggleHeading({ level: 2 }),
    activeKey: "heading",
    activeAttr: { level: 2 },
    title: "Heading 2",
  },
  {
    icon: i.IconH3,
    action: (e) => e.toggleHeading({ level: 3 }),
    activeKey: "heading",
    activeAttr: { level: 3 },
    title: "Heading 3",
  },
  {
    icon: i.IconBold,
    action: (e) => e.toggleBold(),
    activeKey: "bold",
    title: "Bold",
  },
  {
    icon: i.IconItalic,
    action: (e) => e.toggleItalic(),
    activeKey: "italic",
    title: "Italic",
  },
  {
    icon: i.IconStrikethrough,
    action: (e) => e.toggleStrike(),
    activeKey: "strike",
    title: "Strikethrough",
  },
  {
    icon: i.IconCode,
    action: (e) => e.toggleCodeBlock(),
    activeKey: "codeBlock",
    title: "Code Block",
  },
  {
    icon: i.IconMinus,
    action: (e) => e.setHorizontalRule(),
    title: "Horizontal Rule",
  },
  {
    icon: i.IconArrowBack,
    action: (e) => e.undo(),
    undoRedo: "undo",
    title: "Undo",
  },
  {
    icon: i.IconArrowForward,
    action: (e) => e.redo(),
    undoRedo: "redo",
    title: "Redo",
  },
];
const IconRenderer = ({
  icon: Icon,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}) => <Icon className="size-4" />;

export default function RichTextEditor({
  value = "",
  onChange,
}: {
  value?: string;
  onChange?: (html: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML().replace(/<p><\/p>$/, ""));
    },
  });

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      canUndo: ctx.editor?.can().undo() ?? false,
      canRedo: ctx.editor?.can().redo() ?? false,
      activeChecks: TOOLBAR_CONFIG.map(({ activeKey, activeAttr }) =>
        activeKey
          ? (ctx.editor?.isActive(activeKey, activeAttr) ?? false)
          : false,
      ),
    }),
  });

  return (
    <div
      onClick={() => editor?.commands.focus()}
      className="rounded-2xl mt-2 border bg-background border-white/10 focus-within:border-white/30 duration-300 cursor-text outline-none"
    >
      <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 bg-black/20">
        {TOOLBAR_CONFIG.map(
          ({ icon: Icon, action, activeKey, undoRedo, title }, idx) => {
            const isActive = editorState?.activeChecks[idx] ?? false;
            const isDisabled = !mounted
              ? false
              : undoRedo === "undo"
                ? !(editorState?.canUndo ?? false)
                : undoRedo === "redo"
                  ? !(editorState?.canRedo ?? false)
                  : false;

            if (undoRedo) {
              return (
                <button
                  key={title}
                  onClick={() => editor && action(editor.chain().focus()).run()}
                  disabled={isDisabled}
                  title={title}
                  type="button"
                  className={cn(
                    "h-9 w-9 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                    "hover:bg-muted hover:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isDisabled && "opacity-40 pointer-events-none",
                  )}
                >
                  <IconRenderer icon={Icon} />
                </button>
              );
            }

            return (
              <Toggle
                key={title}
                size="sm"
                pressed={isActive}
                onPressedChange={() =>
                  editor && action(editor.chain().focus()).run()
                }
                disabled={isDisabled}
                title={title}
                className={cn(
                  "h-9 w-9 p-0 data-[state=on]:bg-muted",
                  isDisabled && "opacity-40",
                )}
              >
                <IconRenderer icon={Icon} />
              </Toggle>
            );
          },
        )}
      </div>
      <div className="bg-black/20 px-4 h-48 overflow-y-auto">
        <EditorContent className="tiptap" editor={editor} />
      </div>
    </div>
  );
}
