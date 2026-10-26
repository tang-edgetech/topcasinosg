const SIZE_CLASSES: Record<string, string> = {
  full: "",
  large: "max-w-[800px]",
  medium: "max-w-[560px]",
  small: "max-w-[360px]",
};

const ALIGN_CLASSES: Record<string, string> = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
};

// Shared size/alignment presets for the Image and Video blocks.
export function mediaSizeClassName(size: string | undefined): string {
  return SIZE_CLASSES[size ?? ""] ?? SIZE_CLASSES.full;
}

export function mediaAlignClassName(align: string | undefined): string {
  return ALIGN_CLASSES[align ?? ""] ?? ALIGN_CLASSES.center;
}
