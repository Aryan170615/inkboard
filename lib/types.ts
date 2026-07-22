export type ToolType =
  | "select"
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "draw"
  | "text"
  | "eraser";

export type FillStyle = "none" | "hachure" | "cross-hatch" | "dots" | "solid";

export type ShapeType = Exclude<ToolType, "select" | "eraser">;

/**
 * A single shape on the board. x/y/width/height describe the bounding box.
 * - rectangle / ellipse: box only
 * - line / arrow: box only, drawn from (x,y) to (x+width, y+height)
 * - draw: points are absolute canvas coordinates, box is the bounding rect
 * - text: box width/height is the rendered text size, text holds the content
 */
export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  points?: [number, number][];
  text?: string;
  stroke: string;
  fill: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  fontSize: number;
  seed: number;
}

export interface ShapeStyle {
  stroke: string;
  fill: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  fontSize: number;
}
