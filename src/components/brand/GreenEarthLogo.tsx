import * as React from "react";

import newLogo from "@/assets/green-earth-logo-clear.png";
import { cn } from "@/lib/utils";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src">;

export function GreenEarthLogo({
  className,
  alt = "Green Earth",
  ...imgProps
}: Props) {
  return (
    <img
      {...imgProps}
      src={newLogo}
      alt={alt}
      className={cn(className)}
      draggable={false}
      loading={imgProps.loading ?? "eager"}
    />
  );
}
