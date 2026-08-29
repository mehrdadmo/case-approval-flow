import { useRef, useState, useCallback } from 'react';
import { DocumentField, BoundingBox } from '@/types/document';
import { cn } from '@/lib/utils';

interface BoundingBoxSVGProps {
  fields: DocumentField[];
  activeFieldId: string | null;
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
  onFieldClick: (fieldId: string) => void;
  isDrawingMode: boolean;
  onDrawComplete: (box: BoundingBox) => void;
  drawingBox: BoundingBox | null;
  onDrawingChange: (box: BoundingBox | null) => void;
}

export const BoundingBoxSVG = ({
  fields,
  activeFieldId,
  imageWidth,
  imageHeight,
  containerWidth,
  containerHeight,
  onFieldClick,
  isDrawingMode,
  onDrawComplete,
  drawingBox,
  onDrawingChange,
}: BoundingBoxSVGProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  const scaleX = containerWidth / imageWidth;
  const scaleY = containerHeight / imageHeight;

  const getScaledBox = (box: BoundingBox) => ({
    x: box.x * scaleX,
    y: box.y * scaleY,
    width: box.width * scaleX,
    height: box.height * scaleY,
  });

  const getOriginalCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / scaleX,
      y: (clientY - rect.top) / scaleY,
    };
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawingMode) return;
      e.preventDefault();
      e.stopPropagation();
      const coords = getOriginalCoords(e.clientX, e.clientY);
      setStartPoint(coords);
      onDrawingChange({ x: coords.x, y: coords.y, width: 0, height: 0 });
    },
    [isDrawingMode, scaleX, scaleY]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawingMode || !startPoint) return;
      const coords = getOriginalCoords(e.clientX, e.clientY);
      const newBox: BoundingBox = {
        x: Math.min(startPoint.x, coords.x),
        y: Math.min(startPoint.y, coords.y),
        width: Math.abs(coords.x - startPoint.x),
        height: Math.abs(coords.y - startPoint.y),
      };
      onDrawingChange(newBox);
    },
    [isDrawingMode, startPoint, scaleX, scaleY]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawingMode || !drawingBox) {
      setStartPoint(null);
      return;
    }
    if (drawingBox.width < 10 || drawingBox.height < 10) {
      setStartPoint(null);
      onDrawingChange(null);
      return;
    }
    onDrawComplete(drawingBox);
    setStartPoint(null);
    onDrawingChange(null);
  }, [isDrawingMode, drawingBox, onDrawComplete]);

  const getBoxColor = (isActive: boolean) => {
    if (isActive) {
      return { stroke: 'hsl(var(--primary))', fill: 'hsl(var(--primary) / 0.15)' };
    }
    return { stroke: 'hsl(var(--muted-foreground) / 0.5)', fill: 'hsl(var(--muted-foreground) / 0.05)' };
  };

  return (
    <svg
      ref={svgRef}
      className={cn(
        'absolute inset-0 z-10',
        isDrawingMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-auto'
      )}
      width={containerWidth}
      height={containerHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Render all field bounding boxes */}
      {fields.map((field) => {
        const scaledBox = getScaledBox(field.boundingBox);
        const isActive = field.id === activeFieldId;
        const colors = getBoxColor(isActive);

        return (
          <g key={field.id}>
            {/* Background fill */}
            <rect
              x={scaledBox.x}
              y={scaledBox.y}
              width={scaledBox.width}
              height={scaledBox.height}
              fill={colors.fill}
              className="transition-all duration-200"
            />
            {/* Border */}
            <rect
              x={scaledBox.x}
              y={scaledBox.y}
              width={scaledBox.width}
              height={scaledBox.height}
              fill="none"
              stroke={colors.stroke}
              strokeWidth={isActive ? 3 : 2}
              className={cn(
                'transition-all duration-200',
                !isDrawingMode && 'cursor-pointer'
              )}
              style={{ pointerEvents: isDrawingMode ? 'none' : 'auto' }}
              onClick={(e) => {
                if (!isDrawingMode) {
                  e.stopPropagation();
                  onFieldClick(field.id);
                }
              }}
            />
            {/* Active label */}
            {isActive && (
              <g>
                <rect
                  x={scaledBox.x}
                  y={Math.max(0, scaledBox.y - 26)}
                  width={Math.max(scaledBox.width, 100)}
                  height={24}
                  fill="hsl(var(--primary))"
                  rx={4}
                />
                <text
                  x={scaledBox.x + 8}
                  y={Math.max(0, scaledBox.y - 26) + 16}
                  fill="hsl(var(--primary-foreground))"
                  fontSize={12}
                  fontWeight={600}
                  fontFamily="system-ui, sans-serif"
                >
                  {field.key}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Drawing box preview */}
      {drawingBox && drawingBox.width > 0 && (
        <rect
          x={drawingBox.x * scaleX}
          y={drawingBox.y * scaleY}
          width={drawingBox.width * scaleX}
          height={drawingBox.height * scaleY}
          fill="hsl(var(--accent) / 0.2)"
          stroke="hsl(var(--accent))"
          strokeWidth={2}
          strokeDasharray="6,4"
          className="animate-pulse"
        />
      )}
    </svg>
  );
};
