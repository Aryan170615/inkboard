export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export const DEFAULT_CAMERA: Camera = {
  x: 0,
  y: 0,
  zoom: 1,
};

export function worldToScreen(
  x: number,
  y: number,
  camera: Camera
) {
  return {
    x: (x - camera.x) * camera.zoom,
    y: (y - camera.y) * camera.zoom,
  };
}

export function screenToWorld(
  x: number,
  y: number,
  camera: Camera
) {
  return {
    x: x / camera.zoom + camera.x,
    y: y / camera.zoom + camera.y,
  };
}

export function moveCamera(
  camera: Camera,
  dx: number,
  dy: number
): Camera {
  return {
    ...camera,
    x: camera.x - dx / camera.zoom,
    y: camera.y - dy / camera.zoom,
  };
}

export function zoomCamera(
  camera: Camera,
  factor: number,
  mouseX: number,
  mouseY: number
): Camera {
  const before = screenToWorld(mouseX, mouseY, camera);

  const zoom = Math.max(
    0.25,
    Math.min(4, camera.zoom * factor)
  );

  const after = screenToWorld(mouseX, mouseY, {
    ...camera,
    zoom,
  });

  return {
    x: camera.x + before.x - after.x,
    y: camera.y + before.y - after.y,
    zoom,
  };
}