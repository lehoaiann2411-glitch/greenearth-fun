import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/sonner";
// @ts-ignore - virtual module provided by vite-plugin-pwa at build time
import { registerSW } from "virtual:pwa-register";

/**
 * Shows a toast when a new PWA version is available, prompting the user to reload.
 * This helps avoid users being stuck on an old cached build after publishing.
 */
export function PWAUpdateToast() {
  const shownRef = useRef(false);

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (shownRef.current) return;
        shownRef.current = true;

        toast("Có bản cập nhật mới", {
          description: "Nhấn Cập nhật để tải phiên bản mới nhất.",
          duration: Infinity,
          action: {
            label: "Cập nhật",
            onClick: () => updateSW(true),
          },
          cancel: {
            label: "Để sau",
            onClick: () => {
              // keep current version
            },
          },
        });
      },
      onOfflineReady() {
        // Optional: you can notify offline-ready, but keep it silent to avoid noise.
      },
    });

    return () => {
      // no cleanup needed
    };
  }, []);

  return null;
}
