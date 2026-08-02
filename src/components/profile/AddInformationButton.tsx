"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { Modal } from "@/components/ui/Modal";
import { ProfileIntakeTabs } from "@/components/profile/ProfileIntakeTabs";

export function AddInformationButton({ childId, childName }: { childId: string; childName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-press flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all duration-150"
        style={{ borderRadius: RADIUS.sm, background: PALETTE.brand, color: "#fff" }}
      >
        <Plus size={15} /> Add information
      </button>
      {open && (
        <Modal title="Add information" onClose={() => setOpen(false)}>
          <ProfileIntakeTabs childId={childId} childName={childName} />
        </Modal>
      )}
    </>
  );
}
