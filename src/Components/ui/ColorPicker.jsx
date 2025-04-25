"use client";
import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HexColorPicker } from "react-colorful";

export function ColorPicker({
  color,
  onChange,
  className,
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={className}
        >
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: color }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <HexColorPicker
          color={color}
          onChange={onChange}
        />
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-24 px-2 py-1 border rounded text-sm"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}