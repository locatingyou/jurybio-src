"use client"
import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { IconCheck, IconSelector, IconX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"


function ComboboxRoot({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      className={cn(
        "flex min-h-8 w-full items-center justify-between gap-1.5 rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 text-sm transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <IconSelector className="size-4 shrink-0 text-muted-foreground" />
    </PopoverPrimitive.Trigger>
  )
}

function ComboboxContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={cn(
          "z-50 w-(--radix-popover-trigger-width) rounded-xl border border-white/10 bg-input backdrop-blur-md p-1 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function ComboboxItem({
  className,
  selected,
  children,
  onClick,
  ...props
}: React.ComponentProps<"div"> & { selected?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5 select-none",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
      {selected && <IconCheck className="size-4 text-foreground" />}
    </div>
  )
}

function ComboboxBadges({
  values,
  onRemove,
  placeholder,
}: {
  values: string[]
  onRemove: (val: string) => void
  placeholder?: string
}) {
  if (values.length === 0) {
    return <span className="text-muted-foreground text-sm">{placeholder ?? "Select..."}</span>
  }

  const visible = values.slice(0, 2)
  const overflow = values.length - 2

  return (
    <div className="flex items-center gap-1 overflow-hidden min-w-0">
      {visible.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 text-xs shrink-0">
          {v}
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onRemove(v); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onRemove(v);
              }
            }}
            className="ml-0.5 hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
          >
            <IconX className="size-3" />
          </span>
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-xs text-muted-foreground shrink-0">+{overflow}</span>
      )}
    </div>
  )
}

export {
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxItem,
  ComboboxBadges,
}