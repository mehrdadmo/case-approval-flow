import { useState, useCallback } from 'react';
import { DocumentData, BoundingBox, FieldUpdate } from '@/types/document';
import { DocumentCanvas } from './DocumentCanvas';
import { FieldForm } from './FieldForm';
import { useDocumentSync } from '@/hooks/useDocumentSync';
import { toast } from 'sonner';

interface DocumentOverlayProps {
  document: DocumentData;
  onSave: (updates: FieldUpdate[]) => Promise<void>;
}

export const DocumentOverlay = ({ document, onSave }: DocumentOverlayProps) => {
  const {
    activeFieldId,
    setActiveFieldId,
    isDrawingBox,
    setIsDrawingBox,
    drawingBox,
    setDrawingBox,
    pendingUpdates,
    addUpdate,
    clearUpdates,
  } = useDocumentSync();

  const [fields, setFields] = useState(document.fields);
  const [pendingBoxFieldId, setPendingBoxFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldFocus = useCallback((fieldId: string) => {
    setActiveFieldId(fieldId);
    setIsDrawingBox(false);
    setPendingBoxFieldId(null);
  }, [setActiveFieldId, setIsDrawingBox]);

  const handleFieldBlur = useCallback(() => {
    // Don't clear active field immediately to allow for smooth transitions
  }, []);

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId ? { ...f, value, isEdited: value !== f.originalValue } : f
      )
    );
    addUpdate({ fieldId, newValue: value });
  }, [addUpdate]);

  const handleCanvasFieldClick = useCallback((fieldId: string) => {
    setActiveFieldId(fieldId);
  }, [setActiveFieldId]);

  const handleAdjustBox = useCallback((fieldId: string) => {
    setActiveFieldId(fieldId);
    setPendingBoxFieldId(fieldId);
    setIsDrawingBox(true);
    toast.info('Draw a new bounding box on the document');
  }, [setActiveFieldId, setIsDrawingBox]);

  const handleDrawComplete = useCallback((fieldId: string, box: BoundingBox) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId ? { ...f, boundingBox: box, isEdited: true } : f
      )
    );
    addUpdate({ 
      fieldId, 
      newBoundingBox: box,
      newValue: fields.find((f) => f.id === fieldId)?.value || '',
    });
    setIsDrawingBox(false);
    setPendingBoxFieldId(null);
    toast.success('Bounding box updated');
  }, [addUpdate, fields, setIsDrawingBox]);

  const handleDrawModeToggle = useCallback(() => {
    if (isDrawingBox) {
      setIsDrawingBox(false);
      setPendingBoxFieldId(null);
    } else if (activeFieldId) {
      setIsDrawingBox(true);
      setPendingBoxFieldId(activeFieldId);
      toast.info('Draw a new bounding box on the document');
    } else {
      toast.warning('Select a field first to adjust its bounding box');
    }
  }, [isDrawingBox, activeFieldId, setIsDrawingBox]);

  const handleSave = useCallback(async () => {
    if (pendingUpdates.size === 0) return;

    setIsSaving(true);
    try {
      const updates = Array.from(pendingUpdates.values());
      await onSave(updates);
      clearUpdates();
      
      // Reset edited state
      setFields((prev) =>
        prev.map((f) => ({ ...f, isEdited: false, originalValue: f.value }))
      );
      
      toast.success(`Saved ${updates.length} field(s) successfully`);
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [pendingUpdates, onSave, clearUpdates]);

  return (
    <div className="h-screen w-full bg-slate-950 p-4">
      <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Document Canvas */}
        <DocumentCanvas
          document={{ ...document, fields }}
          activeFieldId={activeFieldId}
          onFieldClick={handleCanvasFieldClick}
          isDrawingBox={isDrawingBox}
          onDrawComplete={handleDrawComplete}
          drawingBox={drawingBox}
          onDrawingChange={setDrawingBox}
          onDrawModeToggle={handleDrawModeToggle}
        />

        {/* Right: Field Form */}
        <FieldForm
          fields={fields}
          activeFieldId={activeFieldId}
          onFieldFocus={handleFieldFocus}
          onFieldBlur={handleFieldBlur}
          onFieldChange={handleFieldChange}
          onAdjustBox={handleAdjustBox}
          pendingBoxFieldId={pendingBoxFieldId}
          pendingUpdates={pendingUpdates}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};
