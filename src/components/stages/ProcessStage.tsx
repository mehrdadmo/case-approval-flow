import { useState, useEffect, useCallback } from "react";
import { IconValidated, IconReview, IconNodes, IconExtract } from "@/components/icons/SynapseIcons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DocumentOverlayView } from "@/components/overlay/DocumentOverlayView";
import { DocumentField, BoundingBox } from "@/types/document";

interface ProcessStageProps {
  files: File[];
  onDataExtracted: (data: any[]) => void;
  onApprove: () => void;
}

// Mock comprehensive OCR extracted data with bounding boxes
const generateMockData = (files: File[]) => {
  return files.map((file, index) => ({
    id: `doc-${index}`,
    fileName: file.name,
    fileUrl: URL.createObjectURL(file),
    fileType: file.type,
    imageDimensions: { width: 800, height: 1100 },
    pageNumber: 1,
    totalPages: 1,
    fields: [
      // Document Information
      { 
        id: `field-${index}-1`,
        key: "Document Type",
        category: "Document Info", 
        value: "Commercial Invoice", 
        originalValue: "Commercial Invoice",
        confidence: 98,
        boundingBox: { x: 50, y: 40, width: 200, height: 30 },
        isEdited: false
      },
      { 
        id: `field-${index}-2`,
        key: "Invoice Number",
        category: "Document Info", 
        value: `INV-${1000 + index}`, 
        originalValue: `INV-${1000 + index}`,
        confidence: 95,
        boundingBox: { x: 550, y: 40, width: 180, height: 28 },
        isEdited: false
      },
      { 
        id: `field-${index}-3`,
        key: "Invoice Date",
        category: "Document Info", 
        value: "2024-01-15", 
        originalValue: "2024-01-15",
        confidence: 92,
        boundingBox: { x: 550, y: 80, width: 150, height: 26 },
        isEdited: false
      },
      { 
        id: `field-${index}-4`,
        key: "Due Date",
        category: "Document Info", 
        value: "2024-02-15", 
        originalValue: "2024-02-15",
        confidence: 89,
        boundingBox: { x: 550, y: 120, width: 150, height: 26 },
        isEdited: false
      },
      
      // Supplier Information
      { 
        id: `field-${index}-5`,
        key: "Supplier Name",
        category: "Supplier", 
        value: "Samsung Electronics Co., Ltd.", 
        originalValue: "Samsung Electronics Co., Ltd.",
        confidence: 96,
        boundingBox: { x: 50, y: 180, width: 280, height: 32 },
        isEdited: false
      },
      { 
        id: `field-${index}-6`,
        key: "Supplier Address",
        category: "Supplier", 
        value: "123 Gangnam-gu, Seoul, South Korea", 
        originalValue: "123 Gangnam-gu, Seoul, South Korea",
        confidence: 72,
        boundingBox: { x: 50, y: 220, width: 320, height: 28 },
        isEdited: false
      },
      { 
        id: `field-${index}-7`,
        key: "Supplier Tax ID",
        category: "Supplier", 
        value: "KR-12345678", 
        originalValue: "KR-12345678",
        confidence: 55,
        boundingBox: { x: 50, y: 260, width: 160, height: 26 },
        isEdited: false
      },
      
      // Buyer Information
      { 
        id: `field-${index}-8`,
        key: "Buyer Name",
        category: "Buyer", 
        value: "Iranian Import Company", 
        originalValue: "Iranian Import Company",
        confidence: 94,
        boundingBox: { x: 450, y: 180, width: 250, height: 32 },
        isEdited: false
      },
      { 
        id: `field-${index}-9`,
        key: "Buyer Address",
        category: "Buyer", 
        value: "Tehran, Iran", 
        originalValue: "Tehran, Iran",
        confidence: 67,
        boundingBox: { x: 450, y: 220, width: 200, height: 28 },
        isEdited: false
      },
      
      // Product Details
      { 
        id: `field-${index}-10`,
        key: "Product Description",
        category: "Products", 
        value: "Refrigerator - Commercial Grade", 
        originalValue: "Refrigerator - Commercial Grade",
        confidence: 92,
        boundingBox: { x: 50, y: 350, width: 300, height: 30 },
        isEdited: false
      },
      { 
        id: `field-${index}-11`,
        key: "HS Code",
        category: "Products", 
        value: "8418.10", 
        originalValue: "8418.10",
        confidence: 47,
        boundingBox: { x: 400, y: 350, width: 120, height: 28 },
        isEdited: false
      },
      { 
        id: `field-${index}-12`,
        key: "Quantity",
        category: "Products", 
        value: "120", 
        originalValue: "120",
        confidence: 95,
        boundingBox: { x: 550, y: 350, width: 80, height: 28 },
        isEdited: false
      },
      { 
        id: `field-${index}-13`,
        key: "Unit Price",
        category: "Products", 
        value: "350.00", 
        originalValue: "350.00",
        confidence: 88,
        boundingBox: { x: 650, y: 350, width: 100, height: 28 },
        isEdited: false
      },
      
      // Financial Information
      { 
        id: `field-${index}-14`,
        key: "Subtotal",
        category: "Financial", 
        value: "42,000.00", 
        originalValue: "42,000.00",
        confidence: 91,
        boundingBox: { x: 550, y: 500, width: 150, height: 30 },
        isEdited: false
      },
      { 
        id: `field-${index}-15`,
        key: "Tax Amount",
        category: "Financial", 
        value: "4,200.00", 
        originalValue: "4,200.00",
        confidence: 48,
        boundingBox: { x: 550, y: 540, width: 150, height: 28 },
        isEdited: false
      },
      { 
        id: `field-${index}-16`,
        key: "Total Amount",
        category: "Financial", 
        value: "46,200.00", 
        originalValue: "46,200.00",
        confidence: 89,
        boundingBox: { x: 550, y: 590, width: 180, height: 35 },
        isEdited: false
      },
      { 
        id: `field-${index}-17`,
        key: "Currency",
        category: "Financial", 
        value: "USD", 
        originalValue: "USD",
        confidence: 99,
        boundingBox: { x: 740, y: 590, width: 50, height: 35 },
        isEdited: false
      },
    ] as DocumentField[],
  }));
};

export const ProcessStage = ({ files, onDataExtracted, onApprove }: ProcessStageProps) => {
  const [extractedData, setExtractedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"overlay" | "compact">("overlay");
  const { toast } = useToast();

  useEffect(() => {
    // Simulate processing delay
    setTimeout(() => {
      const data = generateMockData(files);
      setExtractedData(data);
      setIsProcessing(false);
      onDataExtracted(data);
      toast({
        title: "Data extraction complete",
        description: "Review fields using the overlay view - low confidence items are highlighted",
      });
    }, 2000);
  }, [files]);

  const handleFieldUpdate = useCallback((docIndex: number, fieldId: string, updates: Partial<DocumentField>) => {
    setExtractedData((prev) =>
      prev.map((doc, idx) =>
        idx === docIndex
          ? {
              ...doc,
              fields: doc.fields.map((field: DocumentField) =>
                field.id === fieldId
                  ? { ...field, ...updates, isEdited: true }
                  : field
              ),
            }
          : doc
      )
    );
  }, []);

  const handleBoundingBoxUpdate = useCallback((docIndex: number, fieldId: string, newBox: BoundingBox) => {
    handleFieldUpdate(docIndex, fieldId, { boundingBox: newBox });
    toast({
      title: "Bounding box updated",
      description: "The field location has been adjusted",
    });
  }, [handleFieldUpdate, toast]);

  const handleApprove = () => {
    const saveData = extractedData.map((doc) => ({
      documentId: doc.id,
      fileName: doc.fileName,
      fields: doc.fields.map((field: DocumentField) => ({
        fieldId: field.id,
        key: field.key,
        finalValue: field.value,
        spatialValue: field.boundingBox,
        wasEdited: field.isEdited,
        confidence: field.confidence,
      })),
    }));
    console.log("Saving approved data:", saveData);
    toast({ title: "اطلاعات تأیید شد", description: "در حال بررسی ارتباط بین اسناد..." });
    onApprove();
  };

  if (isProcessing) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[500px]">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <IconNodes className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-semibold text-foreground mt-6" dir="rtl">در حال پردازش اسناد...</p>
        <p className="text-sm text-muted-foreground mt-2" dir="rtl">استخراج داده‌ها با هوش مصنوعی</p>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span dir="rtl">در حال تحلیل ساختار سند</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card/50" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">بررسی و ویرایش اطلاعات استخراج‌شده</h2>
            <p className="text-sm text-muted-foreground mt-1">
              روی هر فیلد کلیک کنید تا محل آن در سند مشخص شود • در صورت نیاز مقادیر را ویرایش کنید
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-secondary/50 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("overlay")}
                className={cn(
                  "gap-2 h-8",
                  viewMode === "overlay" && "bg-background shadow-sm"
                )}
              >
                <IconReview className="h-4 w-4" />
                نمای سند
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("compact")}
                className={cn(
                  "gap-2 h-8",
                  viewMode === "compact" && "bg-background shadow-sm"
                )}
              >
                <IconExtract className="h-4 w-4" />
                نمای فشرده
              </Button>
            </div>
            <Button onClick={handleApprove} className="gap-2">
              <IconValidated className="h-4 w-4" />
              تأیید و ادامه
            </Button>
          </div>
        </div>
      </div>

      {/* Document Tabs */}
      {extractedData.length > 1 && (
        <div className="px-6 py-3 border-b border-border bg-secondary/20 flex gap-2 overflow-x-auto">
          {extractedData.map((doc, index) => (
            <Button
              key={doc.id}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDocument(index)}
              className={cn(
                "shrink-0",
                selectedDocument === index && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {doc.fileName}
            </Button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        {extractedData[selectedDocument] && (
          <DocumentOverlayView
            document={extractedData[selectedDocument]}
            onFieldUpdate={(fieldId, updates) => handleFieldUpdate(selectedDocument, fieldId, updates)}
            onBoundingBoxUpdate={(fieldId, box) => handleBoundingBoxUpdate(selectedDocument, fieldId, box)}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  );
};
