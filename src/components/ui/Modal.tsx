"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: "rgba(33,39,29,0.45)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-[520px] max-h-[88vh] overflow-y-auto animate-fade-in-up"
        style={{ background: PALETTE.card, borderRadius: RADIUS.lg }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0"
          style={{ background: PALETTE.card, borderBottom: `1px solid ${PALETTE.line}`, borderRadius: `${RADIUS.lg}px ${RADIUS.lg}px 0 0` }}
        >
          <p className="font-serif-display font-bold" style={{ fontSize: 17 }}>{title}</p>
          <button onClick={onClose} aria-label="Close" className="p-1">
            <X size={18} color={PALETTE.inkSoft} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
