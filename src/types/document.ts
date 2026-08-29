export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DocumentField {
  id: string;
  key: string;
  value: string;
  originalValue: string;
  confidence: number;
  boundingBox: BoundingBox;
  isEdited: boolean;
  category?: string;
  imagePatch?: string;
}

export interface DocumentData {
  id: string;
  imageUrl: string;
  imageDimensions: {
    width: number;
    height: number;
  };
  fields: DocumentField[];
  pageNumber: number;
  totalPages: number;
}

export interface FieldUpdate {
  fieldId: string;
  newValue: string;
  newBoundingBox?: BoundingBox;
  originalImagePatch?: string;
}
