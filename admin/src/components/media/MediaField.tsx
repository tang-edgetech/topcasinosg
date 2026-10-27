"use client";

import { useState, type ReactNode } from "react";
import type { MediaDTO } from "@/lib/types";
import { IconPhoto } from "@/components/Icons";
import MediaPicker from "./MediaPicker";

// The image row shared by every form that takes one picture from the Media
// Library (logos, covers, flags, icons, page-builder images): a thumbnail,
// "Choose From Media Library" while empty, then "Change" and "Remove" once an
// image is set. Callers keep the media id/url state; onRemove should clear
// both, and saving sends a null media id, which the API stores as no image.
export default function MediaField({
  url,
  onSelect,
  onRemove,
  alt = "",
  id,
  previewClassName = "h-14 w-14",
  emptyIcon,
}: {
  url: string | null;
  onSelect: (media: MediaDTO) => void;
  onRemove: () => void;
  alt?: string;
  id?: string;
  previewClassName?: string;
  emptyIcon?: ReactNode;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div id={id} className="media-field flex items-center gap-3">
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        aria-label={url ? "Change image" : "Choose image"}
        className={`media-field__preview flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-surface-muted dark:bg-surface-muted-dark ${previewClassName}`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={alt} className="h-full w-full object-cover" />
        ) : (
          (emptyIcon ?? <IconPhoto width={22} height={22} className="text-primary-400" />)
        )}
      </button>
      <div className="media-field__actions flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="media-field__choose cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-900"
        >
          {url ? "Change" : "Choose From Media Library"}
        </button>
        {url && (
          <button
            type="button"
            onClick={onRemove}
            className="media-field__remove cursor-pointer text-sm text-text-muted hover:text-danger dark:text-text-muted-dark"
          >
            Remove
          </button>
        )}
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onSelect} />
    </div>
  );
}
