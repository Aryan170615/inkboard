"use client";

import { useCallback, useState } from "react";
import {
  Camera,
  DEFAULT_CAMERA,
  moveCamera,
  zoomCamera,
} from "@/lib/camera";

export function useCamera() {
  const [camera, setCamera] =
    useState<Camera>(DEFAULT_CAMERA);

  const pan = useCallback((dx: number, dy: number) => {
    setCamera((c) => moveCamera(c, dx, dy));
  }, []);

  const zoom = useCallback(
    (
      factor: number,
      mouseX: number,
      mouseY: number
    ) => {
      setCamera((c) =>
        zoomCamera(c, factor, mouseX, mouseY)
      );
    },
    []
  );

  const reset = useCallback(() => {
    setCamera(DEFAULT_CAMERA);
  }, []);

  return {
    camera,
    setCamera,
    pan,
    zoom,
    reset,
  };
}