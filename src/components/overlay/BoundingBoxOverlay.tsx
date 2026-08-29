import { useEffect, useRef, useState, useCallback } from 'react';
import { DocumentField, BoundingBox } from '@/types/document';
import { cn } from '@/lib/utils';

interface BoundingBoxOverlayProps {
  fields: DocumentField[];
  activeFieldId: string | null;
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
  onFieldClick: (fieldId: string) => void;
  isDrawingBox: boolean;
  onDrawComplete: (box: BoundingBox) => void;
  drawingBox: BoundingBox | null;
  onDrawingChange: (box: BoundingBox | null) => void;
}

export const BoundingBoxOverlay = ({
  fields,
  activeFieldId,
  imageWidth,
  imageHeight,
  containerWidth,
  containerHeight,
  onFieldClick,
  isDrawingBox,
  onDrawComplete,
  drawingBox,
  onDrawingChange,
}: BoundingBoxOverlayProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  // Calculate scale factors
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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDrawingBox) return;
    const coords = getOriginalCoords(e.clientX, e.clientY);
    setStartPoint(coords);
    onDrawingChange({ x: coords.x, y: coords.y, width: 0, height: 0 });
  }, [isDrawingBox, scaleX, scaleY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawingBox || !startPoint) return;
    const coords = getOriginalCoords(e.clientX, e.clientY);
    const newBox: BoundingBox = {
      x: Math.min(startPoint.x, coords.x),
      y: Math.min(startPoint.y, coords.y),
      width: Math.abs(coords.x - startPoint.x),
      height: Math.abs(coords.y - startPoint.y),
    };
    onDrawingChange(newBox);
  }, [isDrawingBox, startPoint, scaleX, scaleY]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawingBox || !drawingBox || drawingBox.width < 10 || drawingBox.height < 10) {
      setStartPoint(null);
      onDrawingChange(null);
      return;
    }
    onDrawComplete(drawingBox);
    setStartPoint(null);
    onDrawingChange(null);
  }, [isDrawingBox, drawingBox, onDrawComplete]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.15)' };
    if (confidence >= 60) return { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)' };
    return { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.15)' };
  };

  return (
    <svg
      ref={svgRef}
      className={cn(
        'absolute inset-0 pointer-events-auto z-10',
        isDrawingBox && 'cursor-crosshair'
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
        const colors = getConfidenceColor(field.confidence);

        return (
          <g key={field.id}>
            {/* Background fill */}
            <rect
              x={scaledBox.x}
              y={scaledBox.y}
              width={scaledBox.width}
              height={scaledBox.height}
              fill={isActive ? 'rgba(59, 130, 246, 0.25)' : colors.fill}
              className="transition-all duration-200"
            />
            {/* Border */}
            <rect
              x={scaledBox.x}
              y={scaledBox.y}
              width={scaledBox.width}
              height={scaledBox.height}
              fill="none"
              stroke={isActive ? '#3b82f6' : colors.stroke}
              strokeWidth={isActive ? 3 : 2}
              className={cn(
                'transition-all duration-200 cursor-pointer',
                isActive && 'animate-pulse'
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDrawingBox) onFieldClick(field.id);
              }}
              style={{ pointerEvents: isDrawingBox ? 'none' : 'auto' }}
            />
            {/* Label */}
            {isActive && (
              <g>
                <rect
                  x={scaledBox.x}
                  y={scaledBox.y - 24}
                  width={Math.max(scaledBox.width, 80)}
                  height={22}
                  fill="#3b82f6"
                  rx={4}
                />
                <text
                  x={scaledBox.x + 6}
                  y={scaledBox.y - 9}
                  fill="white"
                  fontSize={12}
                  fontWeight={600}
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
          fill="rgba(168, 85, 247, 0.2)"
          stroke="#a855f7"
          strokeWidth={2}
          strokeDasharray="5,5"
          className="animate-pulse"
        />
      )}
    </svg>
  );
};
