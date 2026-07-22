import { Camera } from "./camera";

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: Camera
) {
  const GRID = 40;

  ctx.save();

  ctx.strokeStyle = "#23222D";
  ctx.lineWidth = 1;

  const step = GRID * camera.zoom;

  const offsetX =
    -((camera.x * camera.zoom) % step);

  const offsetY =
    -((camera.y * camera.zoom) % step);

  ctx.beginPath();

  for (let x = offsetX; x <= width; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  for (let y = offsetY; y <= height; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  ctx.stroke();

  ctx.restore();
}