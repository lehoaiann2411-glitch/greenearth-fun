import * as React from "react";

import sourceLogo from "@/assets/green-earth-logo-source.jpg";
import { cn } from "@/lib/utils";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  /**
   * If true, will also remove other near-white pixels not connected to the outside background.
   * Default: false (safer; keeps internal highlights/clouds).
   */
  removeAllNearWhite?: boolean;
};

function isNearWhite(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  // bright + low chroma (white/gray)
  return max > 235 && max - min < 28;
}

export function GreenEarthLogo({
  className,
  alt = "Green Earth",
  removeAllNearWhite = false,
  ...imgProps
}: Props) {
  const [src, setSrc] = React.useState<string>(sourceLogo);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const img = new Image();
      img.decoding = "async";
      img.src = sourceLogo;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load logo source"));
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const { width, height } = canvas;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      const visited = new Uint8Array(width * height);
      const queueX = new Int32Array(width * height);
      const queueY = new Int32Array(width * height);
      let qh = 0;
      let qt = 0;

      const enqueue = (x: number, y: number) => {
        queueX[qt] = x;
        queueY[qt] = y;
        qt++;
      };

      const idx = (x: number, y: number) => y * width + x;
      const p = (x: number, y: number) => (y * width + x) * 4;

      // Seed with all edge pixels
      for (let x = 0; x < width; x++) {
        enqueue(x, 0);
        enqueue(x, height - 1);
      }
      for (let y = 1; y < height - 1; y++) {
        enqueue(0, y);
        enqueue(width - 1, y);
      }

      // Flood fill: remove background + white sticker border that touches the outside
      while (qh < qt) {
        const x = queueX[qh];
        const y = queueY[qh];
        qh++;

        const vi = idx(x, y);
        if (visited[vi]) continue;
        visited[vi] = 1;

        const pi = p(x, y);
        const r = data[pi];
        const g = data[pi + 1];
        const b = data[pi + 2];

        if (!isNearWhite(r, g, b)) continue;

        // make transparent
        data[pi + 3] = 0;

        // 4-neighbors
        if (x > 0) enqueue(x - 1, y);
        if (x < width - 1) enqueue(x + 1, y);
        if (y > 0) enqueue(x, y - 1);
        if (y < height - 1) enqueue(x, y + 1);
      }

      if (removeAllNearWhite) {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const pi = p(x, y);
            if (data[pi + 3] === 0) continue;
            const r = data[pi];
            const g = data[pi + 1];
            const b = data[pi + 2];
            if (isNearWhite(r, g, b)) data[pi + 3] = 0;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const out = canvas.toDataURL("image/png");
      if (!cancelled) setSrc(out);
    };

    run().catch(() => {
      // fallback to sourceLogo if processing fails
      if (!cancelled) setSrc(sourceLogo);
    });

    return () => {
      cancelled = true;
    };
  }, [removeAllNearWhite]);

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
