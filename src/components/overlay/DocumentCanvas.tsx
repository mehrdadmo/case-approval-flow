import { useRef, useState, useEffect, useCallback } from 'react';
import { DocumentData, BoundingBox } from '@/types/document';
import { BoundingBoxOverlay } from './BoundingBoxOverlay';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Move, PenTool, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentCanvasProps {
  document: DocumentData;
  activeFieldId: string | null;
  onFieldClick: (fieldId: string) => void;
  isDrawingBox: boolean;
  onDrawComplete: (fieldId: string, box: BoundingBox) => void;
  drawingBox: BoundingBox | null;
  onDrawingChange: (box: BoundingBox | null) => void;
  onDrawModeToggle: () => void;
}

export const DocumentCanvas = ({
  document,
  activeFieldId,
  onFieldClick,
  isDrawingBox,
  onDrawComplete,
  drawingBox,
  onDrawingChange,
  onDrawModeToggle,
}: DocumentCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-scroll to active field
  useEffect(() => {
    if (!activeFieldId || !containerRef.current) return;
    
    const field = document.fields.find((f) => f.id === activeFieldId);
    if (!field) return;

    const { boundingBox } = field;
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;

    // Calculate pan to center the field
    const scaledWidth = document.imageDimensions.width * zoom;
    const scaledHeight = document.imageDimensions.height * zoom;
    
    const targetPanX = containerSize.width / 2 - centerX * zoom;
    const targetPanY = containerSize.height / 2 - centerY * zoom;

    // Clamp pan values
    const maxPanX = 0;
    const minPanX = Math.min(0, containerSize.width - scaledWidth);
    const maxPanY = 0;
    const minPanY = Math.min(0, containerSize.height - scaledHeight);

    setPan({
      x: Math.max(minPanX, Math.min(maxPanX, targetPanX)),
      y: Math.max(minPanY, Math.min(maxPanY, targetPanY)),
    });

    // Auto-zoom if field is small
    const fieldArea = boundingBox.width * boundingBox.height;
    const imageArea = document.imageDimensions.width * document.imageDimensions.height;
    if (fieldArea / imageArea < 0.01 && zoom < 2) {
      setZoom(2);
    }
  }, [activeFieldId, document.fields, document.imageDimensions, containerSize, zoom]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((z) => Math.max(0.5, Math.min(4, z * delta)));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan((p) => ({
        x: p.x + e.movementX,
        y: p.y + e.movementY,
      }));
    }
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const scaledWidth = document.imageDimensions.width * zoom;
  const scaledHeight = document.imageDimensions.height * zoom;

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-300">
            Page {document.pageNumber} of {document.totalPages}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <ZoomOut size={18} />
          </Button>
          <span className="text-sm text-slate-400 w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <ZoomIn size={18} />
          </Button>
          <div className="w-px h-6 bg-slate-600 mx-2" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onDrawModeToggle}
            className={cn(
              'text-slate-300 hover:text-white hover:bg-slate-700',
              isDrawingBox && 'bg-purple-600 text-white hover:bg-purple-700'
            )}
          >
            <PenTool size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetView}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <RotateCcw size={18} />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-hidden relative',
          isPanning && 'cursor-grabbing'
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute transition-transform duration-200"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            width: scaledWidth,
            height: scaledHeight,
          }}
        >
          {/* Document Image */}
          <img
            src={document.imageUrl}
            alt="Document"
            className="w-full h-full object-contain"
            draggable={false}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Bounding Box Overlay */}
          {imageLoaded && (
            <BoundingBoxOverlay
              fields={document.fields}
              activeFieldId={activeFieldId}
              imageWidth={document.imageDimensions.width}
              imageHeight={document.imageDimensions.height}
              containerWidth={scaledWidth}
              containerHeight={scaledHeight}
              onFieldClick={onFieldClick}
              isDrawingBox={isDrawingBox}
              onDrawComplete={(box) => {
                if (activeFieldId) {
                  onDrawComplete(activeFieldId, box);
                }
              }}
              drawingBox={drawingBox}
              onDrawingChange={onDrawingChange}
            />
          )}
        </div>

        {/* Drawing Mode Indicator */}
        {isDrawingBox && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-purple-600/90 rounded-full text-white text-sm font-medium flex items-center gap-2 shadow-lg">
            <PenTool size={16} />
            <span>Draw a box to adjust field location</span>
          </div>
        )}

        {/* Zoom Hint */}
        <div className="absolute bottom-4 right-4 text-xs text-slate-500">
          Ctrl + Scroll to zoom • Alt + Drag to pan
        </div>
      </div>
    </div>
  );
};
