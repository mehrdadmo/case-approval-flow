import { useState, useCallback, useRef } from 'react';
import { DocumentField, BoundingBox, FieldUpdate } from '@/types/document';

interface UseDocumentSyncReturn {
  activeFieldId: string | null;
  setActiveFieldId: (id: string | null) => void;
  isDrawingBox: boolean;
  setIsDrawingBox: (drawing: boolean) => void;
  drawingBox: BoundingBox | null;
  setDrawingBox: (box: BoundingBox | null) => void;
  pendingUpdates: Map<string, FieldUpdate>;
  addUpdate: (update: FieldUpdate) => void;
  clearUpdates: () => void;
  getFieldUpdate: (fieldId: string) => FieldUpdate | undefined;
}

export const useDocumentSync = (): UseDocumentSyncReturn => {
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isDrawingBox, setIsDrawingBox] = useState(false);
  const [drawingBox, setDrawingBox] = useState<BoundingBox | null>(null);
  const pendingUpdates = useRef<Map<string, FieldUpdate>>(new Map());
  const [, forceUpdate] = useState({});

  const addUpdate = useCallback((update: FieldUpdate) => {
    pendingUpdates.current.set(update.fieldId, {
      ...pendingUpdates.current.get(update.fieldId),
      ...update,
    });
    forceUpdate({});
  }, []);

  const clearUpdates = useCallback(() => {
    pendingUpdates.current.clear();
    forceUpdate({});
  }, []);

  const getFieldUpdate = useCallback((fieldId: string) => {
    return pendingUpdates.current.get(fieldId);
  }, []);

  return {
    activeFieldId,
    setActiveFieldId,
    isDrawingBox,
    setIsDrawingBox,
    drawingBox,
    setDrawingBox,
    pendingUpdates: pendingUpdates.current,
    addUpdate,
    clearUpdates,
    getFieldUpdate,
  };
};
