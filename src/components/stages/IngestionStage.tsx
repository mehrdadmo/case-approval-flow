import { useState, useCallback } from "react";
import { Upload, FileText, Image, FileType, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface IngestionStageProps {
  onFilesUploaded: (files: File[]) => void;
}

export const IngestionStage = ({ onFilesUploaded }: IngestionStageProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      const isValid =
        file.type === "application/pdf" ||
        file.type.startsWith("image/") ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword";
      
      if (!isValid) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported format`,
          variant: "destructive",
        });
      }
      return isValid;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") return FileText;
    if (file.type.startsWith("image/")) return Image;
    return FileType;
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Files uploaded successfully",
      description: `${files.length} file(s) ready for processing`,
    });
    onFilesUploaded(files);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Document Ingestion</h2>
        <p className="text-muted-foreground">Upload your documents to begin processing</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          "border-2 border-dashed rounded-xl p-12 transition-all duration-300",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-secondary/30"
        )}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Upload className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground mb-1">
              Drop your files here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, Images (JPG, PNG), and Word documents
            </p>
          </div>
          <input
            type="file"
            multiple
            accept=".pdf,image/*,.doc,.docx"
            onChange={(e) => handleFiles(Array.from(e.target.files || []))}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button asChild variant="default" size="lg">
              <span className="cursor-pointer">Select Files</span>
            </Button>
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Selected Files ({files.length})</h3>
          <div className="grid gap-3">
            {files.map((file, index) => {
              const Icon = getFileIcon(file);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleUpload} size="lg" className="gap-2">
              <Upload className="h-4 w-4" />
              Process {files.length} File{files.length > 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
