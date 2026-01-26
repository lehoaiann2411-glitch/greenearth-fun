import animatedLogo from "@/assets/green-earth-logo-animated.gif";
import { cn } from "@/lib/utils";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  alt?: string;
};

export function GreenEarthLogo({
  className,
  alt = "Green Earth",
  ...imgProps
}: Props) {
  return (
    <img
      {...imgProps}
      src={animatedLogo}
      alt={alt}
      className={cn("mix-blend-screen", className)}
      draggable={false}
    />
  );
}
