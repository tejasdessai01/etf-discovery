"use client";

import * as React from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useRouter } from "next/navigation";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();

  const go = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => go("/etfs")}>All ETFs</CommandItem>
          {/* Stubs for future pages */}
          <CommandItem onSelect={() => go("/etfs?filter=ai")}>AI-tagged ETFs</CommandItem>
          <CommandItem onSelect={() => go("/watchlists")}>Watchlists (soon)</CommandItem>
          <CommandItem onSelect={() => go("/views")}>Saved Views (soon)</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => alert("Export coming soon")}>Export CSV (soon)</CommandItem>
          <CommandItem onSelect={() => alert("Save view coming soon")}>Save Current View (soon)</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
