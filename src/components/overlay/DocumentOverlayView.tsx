import { useState, useCallback, useRef, useEffect } from 'react';
import { DocumentField, BoundingBox } from '@/types/document';
import { OverlayCanvas } from './OverlayCanvas';
import { FieldPanel } from './FieldPanel';

interface DocumentOverlayViewProps {
  document: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    imageDimensions: { width: number; height: number };
    pageNumber: number;
    totalPages: number;
    fields: DocumentField[];
  };
  onFieldUpdate: (fieldId: string, updates: Partial<DocumentField>) => void;
  onBoundingBoxUpdate: (fieldId: string, box: BoundingBox) => void;
  viewMode: 'overlay' | 'compact';
}

export const DocumentOverlayView = ({
  document,
  onFieldUpdate,
  onBoundingBoxUpdate,
  viewMode,
}: DocumentOverlayViewProps) => {
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingBox, setDrawingBox] = useState<BoundingBox | null>(null);

  const handleFieldFocus = useCallback((fieldId: string) => {
    setActiveFieldId(fieldId);
    setIsDrawingMode(false);
    setDrawingBox(null);
  }, []);

  const handleFieldBlur = useCallback(() => {
    // Keep field active for smooth transitions
  }, []);

  const handleValueChange = useCallback((fieldId: string, value: string) => {
    onFieldUpdate(fieldId, { value });
  }, [onFieldUpdate]);

  const handleAdjustBox = useCallback((fieldId: string) => {
    setActiveFieldId(fieldId);
    setIsDrawingMode(true);
  }, []);

  const handleDrawComplete = useCallback((box: BoundingBox) => {
    if (activeFieldId) {
      onBoundingBoxUpdate(activeFieldId, box);
    }
    setIsDrawingMode(false);
    setDrawingBox(null);
  }, [activeFieldId, onBoundingBoxUpdate]);

  const handleDrawModeToggle = useCallback(() => {
    if (activeFieldId) {
      setIsDrawingMode((prev) => !prev);
      if (isDrawingMode) {
        setDrawingBox(null);
      }
    }
  }, [activeFieldId, isDrawingMode]);

  const handleCanvasFieldClick = useCallback((fieldId: string) => {
    setActiveFieldId(fieldId);
    setIsDrawingMode(false);
  }, []);

  if (viewMode === 'compact') {
    return (
      <div className="h-full p-6">
        <FieldPanel
          fields={document.fields}
          activeFieldId={activeFieldId}
          onFieldFocus={handleFieldFocus}
          onFieldBlur={handleFieldBlur}
          onValueChange={handleValueChange}
          onAdjustBox={handleAdjustBox}
          isDrawingMode={isDrawingMode}
          compactMode
        />
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
      {/* Left: Interactive Canvas */}
      <div className="h-full border-r border-border">
        <OverlayCanvas
          imageUrl={document.fileUrl}
          fileType={document.fileType}
          imageDimensions={document.imageDimensions}
          fields={document.fields}
          activeFieldId={activeFieldId}
          onFieldClick={handleCanvasFieldClick}
          isDrawingMode={isDrawingMode}
          onDrawComplete={handleDrawComplete}
          drawingBox={drawingBox}
          onDrawingChange={setDrawingBox}
          onDrawModeToggle={handleDrawModeToggle}
          pageNumber={document.pageNumber}
          totalPages={document.totalPages}
        />
      </div>

      {/* Right: Field Form */}
      <div className="h-full overflow-hidden">
        <FieldPanel
          fields={document.fields}
          activeFieldId={activeFieldId}
          onFieldFocus={handleFieldFocus}
          onFieldBlur={handleFieldBlur}
          onValueChange={handleValueChange}
          onAdjustBox={handleAdjustBox}
          isDrawingMode={isDrawingMode}
        />
      </div>
    </div>
  );
};
