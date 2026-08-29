import { useRef, useState, useEffect, useCallback } from 'react';
import { DocumentField, BoundingBox } from '@/types/document';
import { BoundingBoxSVG } from './BoundingBoxSVG';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, PenTool, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverlayCanvasProps {
  imageUrl: string;
  fileType: string;
  imageDimensions: { width: number; height: number };
  fields: DocumentField[];
  activeFieldId: string | null;
  onFieldClick: (fieldId: string) => void;
  isDrawingMode: boolean;
  onDrawComplete: (box: BoundingBox) => void;
  drawingBox: BoundingBox | null;
  onDrawingChange: (box: BoundingBox | null) => void;
  onDrawModeToggle: () => void;
  pageNumber: number;
  totalPages: number;
}

export const OverlayCanvas = ({
  imageUrl,
  fileType,
  imageDimensions,
  fields,
  activeFieldId,
  onFieldClick,
  isDrawingMode,
  onDrawComplete,
  drawingBox,
  onDrawingChange,
  onDrawModeToggle,
  pageNumber,
  totalPages,
}: OverlayCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height - 56 }); // Subtract toolbar height
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-pan to active field
  useEffect(() => {
    if (!activeFieldId || !containerSize.width) return;

    const field = fields.find((f) => f.id === activeFieldId);
    if (!field) return;

    const { boundingBox } = field;
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;

    // Calculate pan to center the field
    const scaledWidth = imageDimensions.width * zoom;
    const scaledHeight = imageDimensions.height * zoom;

    const targetPanX = containerSize.width / 2 - centerX * zoom;
    const targetPanY = containerSize.height / 2 - centerY * zoom;

    // Clamp pan values
    const maxPanX = 50;
    const minPanX = Math.min(50, containerSize.width - scaledWidth + 50);
    const maxPanY = 50;
    const minPanY = Math.min(50, containerSize.height - scaledHeight + 50);

    setPan({
      x: Math.max(minPanX, Math.min(maxPanX, targetPanX)),
      y: Math.max(minPanY, Math.min(maxPanY, targetPanY)),
    });

    // Auto-zoom for small fields
    const fieldArea = boundingBox.width * boundingBox.height;
    const imageArea = imageDimensions.width * imageDimensions.height;
    if (fieldArea / imageArea < 0.01 && zoom < 1.5) {
      setZoom(1.5);
    }
  }, [activeFieldId, fields, imageDimensions, containerSize, zoom]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((z) => Math.max(0.5, Math.min(4, z * delta)));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
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

  const fitToWidth = () => {
    if (containerSize.width && imageDimensions.width) {
      const newZoom = (containerSize.width - 40) / imageDimensions.width;
      setZoom(Math.min(newZoom, 1.5));
      setPan({ x: 20, y: 20 });
    }
  };

  useEffect(() => {
    if (containerSize.width && imageDimensions.width && !imageLoaded) {
      fitToWidth();
    }
  }, [containerSize.width, imageDimensions.width]);

  const scaledWidth = imageDimensions.width * zoom;
  const scaledHeight = imageDimensions.height * zoom;

  // For non-image files, show a placeholder
  const isImage = fileType?.startsWith('image/');
  const isPdf = fileType === 'application/pdf' || imageUrl?.toLowerCase().endsWith('.pdf');

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground" dir="rtl">
            صفحه {pageNumber} از {totalPages}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="h-8 w-8 p-0"
          >
            <ZoomOut size={16} />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
            className="h-8 w-8 p-0"
          >
            <ZoomIn size={16} />
          </Button>
          <div className="w-px h-5 bg-border mx-2" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onDrawModeToggle}
            disabled={!activeFieldId}
            className={cn(
              'h-8 px-3 gap-2',
              isDrawingMode && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <PenTool size={14} />
            <span className="text-xs">تنظیم محدوده</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetView}
            className="h-8 w-8 p-0"
          >
            <RotateCcw size={16} />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        className={cn(
          'flex-1 overflow-hidden relative',
          isPanning && 'cursor-grabbing',
          isDrawingMode && 'cursor-crosshair'
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute transition-transform duration-150"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            width: scaledWidth,
            height: scaledHeight,
          }}
        >
          {/* Document Preview */}
          {isImage ? (
            <img
              src={imageUrl}
              alt="Document"
              className="w-full h-full object-contain rounded-lg shadow-lg"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
            />
          ) : isPdf ? (
            <iframe
              src={`${imageUrl}#toolbar=0&navpanes=0&view=FitH`}
              title="Document preview"
              className="w-full h-full rounded-lg shadow-lg bg-white"
              style={{ minHeight: scaledHeight }}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div 
              className="w-full h-full bg-white rounded-lg shadow-lg flex items-center justify-center"
              style={{ minHeight: scaledHeight }}
            >
              <div className="text-center p-8">
                <div className="w-20 h-24 mx-auto mb-4 bg-muted rounded flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted-foreground">
                    DOC
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">پیش‌نمایش سند</p>
                <p className="text-xs text-muted-foreground mt-1">فیلدها به مختصات سند نگاشت شده‌اند</p>
              </div>
            </div>
          )}

          {/* Bounding Box Overlay */}
          <BoundingBoxSVG
            fields={fields}
            activeFieldId={activeFieldId}
            imageWidth={imageDimensions.width}
            imageHeight={imageDimensions.height}
            containerWidth={scaledWidth}
            containerHeight={scaledHeight}
            onFieldClick={onFieldClick}
            isDrawingMode={isDrawingMode}
            onDrawComplete={onDrawComplete}
            drawingBox={drawingBox}
            onDrawingChange={onDrawingChange}
          />
        </div>

        {/* Drawing Mode Indicator */}
        {isDrawingMode && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary/90 rounded-full text-primary-foreground text-sm font-medium flex items-center gap-2 shadow-lg backdrop-blur-sm">
            <PenTool size={14} />
            <span>یک محدوده رسم کنید تا محل فیلد به‌روزرسانی شود</span>
          </div>
        )}

        {/* Controls Hint */}
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded backdrop-blur-sm" dir="rtl">
          Ctrl+چرخش برای بزرگ‌نمایی • Alt+درگ برای جابه‌جایی
        </div>
      </div>
    </div>
  );
};
