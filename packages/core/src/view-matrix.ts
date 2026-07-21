export interface ViewMatrix {
  /** logical → CSS px: css = logical * scale + offset */
  scale: number;
  offsetX: number;
  offsetY: number;
  cssWidth: number;
  cssHeight: number;
  dpr: number;
}

export interface LogicalPoint {
  x: number;
  y: number;
}

/**
 * Fit logical page (width × height) into a CSS box, preserving aspect ratio (letterbox).
 */
export function computeViewMatrix(opts: {
  logicalWidth: number;
  logicalHeight: number;
  cssWidth: number;
  cssHeight: number;
  dpr?: number;
}): ViewMatrix {
  const { logicalWidth, logicalHeight, cssWidth, cssHeight, dpr = 1 } = opts;
  const scale = Math.min(cssWidth / logicalWidth, cssHeight / logicalHeight);
  const drawnW = logicalWidth * scale;
  const drawnH = logicalHeight * scale;
  return {
    scale,
    offsetX: (cssWidth - drawnW) / 2,
    offsetY: (cssHeight - drawnH) / 2,
    cssWidth,
    cssHeight,
    dpr,
  };
}

export function clientToLogical(
  clientX: number,
  clientY: number,
  hostRect: { left: number; top: number },
  matrix: ViewMatrix,
): LogicalPoint {
  const x = (clientX - hostRect.left - matrix.offsetX) / matrix.scale;
  const y = (clientY - hostRect.top - matrix.offsetY) / matrix.scale;
  return { x, y };
}

export function logicalToCss(point: LogicalPoint, matrix: ViewMatrix): { x: number; y: number } {
  return {
    x: point.x * matrix.scale + matrix.offsetX,
    y: point.y * matrix.scale + matrix.offsetY,
  };
}
