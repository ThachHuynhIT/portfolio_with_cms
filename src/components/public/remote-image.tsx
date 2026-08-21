import Image from "next/image";

type RemoteImageProps = {
  src: string | null | undefined;
  alt: string;
  // No baked-in default — the right value depends on the grid/layout the
  // consumer places this in, so a wrong-for-context default would be worse
  // than forcing every call site to state it.
  sizes: string;
  priority?: boolean;
  className?: string;
};

// Wraps next/image with `fill` for use inside a container sized by the
// `aspect-media` mixin (Phase 10 §3). Only res.cloudinary.com is whitelisted
// in next.config.ts — an admin-entered URL from elsewhere will 400 at
// /_next/image (a broken-image icon, not a 500), which is an accepted
// limitation until the upload phase ships real validation.
export function RemoteImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: RemoteImageProps) {
  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
