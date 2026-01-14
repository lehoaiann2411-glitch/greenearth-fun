import * as React from "react";

import sourceLogo from "@/assets/green-earth-logo-source.jpg";
import { cn } from "@/lib/utils";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  /**
   * If true, will also remove other near-white pixels not connected to the outside background.
   * Default: false (safer; keeps internal highlights/clouds).
   */
  removeAllNearWhite?: boolean;
  /**
   * Downscale the source image before processing to avoid memory spikes.
   * Default: 1024.
   */
  maxSize?: number;
};

function isNearWhite(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // brightness 0..1
  const brightness = max / 255;
  // saturation proxy 0..1 (lower = closer to gray/white)
  const saturation = max === 0 ? 0 : delta / max;

  // A bit more tolerant than before (JPEG compression / lighting)
  return brightness > 0.82 && saturation < 0.22;
}

function downscaleDimensions(
  width: number,
  height: number,
  maxSize: number
): { width: number; height: number } {
  const maxSide = Math.max(width, height);
  if (maxSide <= maxSize) return { width, height };

  const scale = maxSize / maxSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function GreenEarthLogo({
  className,
  alt = "Green Earth",
  removeAllNearWhite = false,
  maxSize = 1024,
  ...imgProps
}: Props) {
  const [src, setSrc] = React.useState<string>(sourceLogo);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const img = new Image();
      img.decoding = "async";
      // Helps prevent canvas tainting in edge cases.
      img.crossOrigin = "anonymous";
      img.src = sourceLogo;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load logo source"));
      });

      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      const { width, height } = downscaleDimensions(naturalW, naturalH, maxSize);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const n = width * height;

      // Flood fill from edges to remove background (and any white border connected to it)
      const visited = new Uint8Array(n);
      const queue = new Int32Array(n);
      let qh = 0;
      let qt = 0;

      const enqueue = (i: number) => {
        queue[qt] = i;
        qt++;
      };

      // Seed with all edge pixels
      for (let x = 0; x < width; x++) {
        enqueue(x);
        enqueue((height - 1) * width + x);
      }
      for (let y = 1; y < height - 1; y++) {
        enqueue(y * width);
        enqueue(y * width + (width - 1));
      }

      const p = (i: number) => i * 4;

      while (qh < qt) {
        const i = queue[qh];
        qh++;

        if (visited[i]) continue;
        visited[i] = 1;

        const pi = p(i);
        const r = data[pi];
        const g = data[pi + 1];
        const b = data[pi + 2];

        if (!isNearWhite(r, g, b)) continue;

        // make transparent
        data[pi + 3] = 0;

        const x = i % width;
        const y = (i / width) | 0;

        // 4-neighbors
        if (x > 0) enqueue(i - 1);
        if (x < width - 1) enqueue(i + 1);
        if (y > 0) enqueue(i - width);
        if (y < height - 1) enqueue(i + width);
      }

      if (removeAllNearWhite) {
        for (let i = 0; i < n; i++) {
          const pi = p(i);
          if (data[pi + 3] === 0) continue;
          const r = data[pi];
          const g = data[pi + 1];
          const b = data[pi + 2];
          if (isNearWhite(r, g, b)) data[pi + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const out = canvas.toDataURL("image/png");
      if (!cancelled) setSrc(out);
    };

    run().catch((err) => {
      // fallback to sourceLogo if processing fails
      console.warn("[GreenEarthLogo] processing failed", err);
      if (!cancelled) setSrc(sourceLogo);
    });

    return () => {
      cancelled = true;
    };
  }, [removeAllNearWhite, maxSize]);

  return (
    <img
      {...imgProps}
      src={src}
      alt={alt}
      className={cn(className)}
      draggable={false}
      loading={imgProps.loading ?? "eager"}
    />
  );
}
