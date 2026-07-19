"use client";

import { Modal } from "antd";
import MediaLibrary from "./MediaLibrary";
import type { MediaDTO } from "@/lib/types";

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaDTO) => void;
}

// Reusable across any content form that needs to attach an existing upload
// or add a new one (Guides, Casino reviews, News, ...) without duplicating
// the grid/upload/filter UI each time.
export default function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
  return (
    <Modal rootClassName="media-picker-modal" title="Select Media" open={open} onCancel={onClose} footer={null} width={800}>
      <MediaLibrary
        selectable
        onSelect={(media) => {
          onSelect(media);
          onClose();
        }}
      />
    </Modal>
  );
}
