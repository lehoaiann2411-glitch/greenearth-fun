import * as React from "react";

import animatedLogo from "@/assets/green-earth-logo-animated.mp4";
import { cn } from "@/lib/utils";

type Props = Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "src"> & {
  alt?: string;
};

export function GreenEarthLogo({
  className,
  alt = "Green Earth",
  ...videoProps
}: Props) {
  return (
    <video
      {...videoProps}
      src={animatedLogo}
      className={cn("mix-blend-multiply dark:mix-blend-screen dark:invert", className)}
      autoPlay
      loop
      muted
      playsInline
      draggable={false}
      aria-label={alt}
    />
  );
}
