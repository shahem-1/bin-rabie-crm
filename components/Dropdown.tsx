"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  className?: string;
}

export function Dropdown({ trigger, items, align = "end", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      // Ignore clicks on the dropdown content (in portal) or the wrapper
      if (wrapperRef.current && wrapperRef.current.contains(target)) return;
      if (dropdownRef.current && dropdownRef.current.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    // Calculate position when opening with dynamic boundary detection (vertical dropup logic)
    // and layout calculation (wrapperRef w-full sidebar alignment).
    const wrapperEl = wrapperRef.current;
    if (wrapperEl) {
      const rect = wrapperEl.getBoundingClientRect();
      const dropdownWidth = 224; // w-56 = 224px
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isRTL = document.dir === "rtl";

      // Horizontal position calculations (left property for fixed positioning)
      let left: number;
      if (align === "end") {
        // Right-aligned: try to align right edge with wrapper's right edge
        left = rect.right - dropdownWidth;
        // Clamp to viewport boundaries
        if (left < 8) left = 8;
        if (left + dropdownWidth > viewportWidth - 8) {
          left = viewportWidth - dropdownWidth - 8;
        }
      } else {
        // Left-aligned (align="start"): align left edge with wrapper's left edge
        if (isRTL) {
          left = rect.right - dropdownWidth;
          if (left < 8) left = 8;
        } else {
          left = rect.left;
          if (left + dropdownWidth > viewportWidth - 8) {
            left = viewportWidth - dropdownWidth - 8;
          }
          if (left < 8) left = 8;
        }
      }

      // Vertical position calculations with Dropup logic for fixed positioning
      const estimatedHeight = 140; // Approx height for dropdown items list

      const fallsOffBottom = rect.bottom + 4 + estimatedHeight > viewportHeight;
      const enoughRoomAtTop = rect.top > estimatedHeight + 16;

      let topPosition: number;
      if (fallsOffBottom && enoughRoomAtTop) {
        // Dropup: anchor top edge of dropdown to top edge of trigger minus height
        topPosition = rect.top - estimatedHeight - 4;
      } else {
        // Dropdown: anchor top edge of dropdown to bottom edge of trigger plus 4px
        topPosition = rect.bottom + 4;
      }

      setPosition({
        top: topPosition,
        left,
      });
    }
    setOpen(true);
  };

  const handleItemClick = (item: DropdownItem) => {
    item.onClick();
    setOpen(false);
  };

  const dropdownContent = open && position ? (
    createPortal(
      <div
        ref={dropdownRef}
        className={cn(
          "dropdown-enter fixed z-50 w-56 rounded-xl border border-line bg-card shadow-lg py-1.5",
          "top-0 left-0"
        )}
        style={{ top: position.top, left: position.left }}
        role="menu"
      >
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors",
              item.danger
                ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20"
                : "text-foreground hover:bg-muted/50 focus:bg-muted/50",
              item.disabled && "opacity-50 cursor-not-allowed"
            )}
            role="menuitem"
          >
            {item.icon && <span className="flex h-4 w-4">{item.icon}</span>}
            <span className="flex-1 text-start">{item.label}</span>
          </button>
        ))}
      </div>,
      document.body
    )
  ) : null;

  const overlay = open ? (
    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
  ) : null;

  return (
    <div ref={wrapperRef} className={cn("relative block w-full", className)}>
      <div className="flex items-center gap-1 w-full">
        <span
          ref={triggerRef}
          onClick={handleToggle}
          className="flex items-center gap-1 cursor-pointer focus:outline-none flex-1"
          aria-haspopup="true"
          aria-expanded={open}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle();
            }
          }}
        >
          {trigger}
        </span>
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180", "flex-shrink-0")} />
      </div>
      {overlay}
      {dropdownContent}
    </div>
  );
}

interface SimpleDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SimpleDropdown({ trigger, children, align = "end", className, open, onOpenChange }: SimpleDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const controlledOpen = open ?? isOpen;
  const setOpen = onOpenChange ?? setIsOpen;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (controlledOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [controlledOpen]);

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <div onClick={() => !open && setOpen(!controlledOpen)} className="flex items-center gap-1">
        {trigger}
        {!open && <ChevronDown size={14} className={cn("transition-transform", controlledOpen && "rotate-180")} />}
      </div>

      {controlledOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              "dropdown-enter fixed z-50 mt-2 w-64 rounded-xl border border-line bg-card shadow-lg py-1.5",
              align === "end" ? "right-0" : "left-0"
            )}
            role="menu"
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}