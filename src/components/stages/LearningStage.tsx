import { FileSpreadsheet, FileText, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LearningStageProps {
  complianceData: any;
}

export const LearningStage = ({ complianceData }: LearningStageProps) => {
  const { toast } = useToast();

  const handleExport = (format: string) => {
    toast({
      title: `Exporting to ${format}`,
      description: "Your data is being prepared for download",
    });
  };

  const handleApiExport = (system: string) => {
    toast({
      title: `Exporting to ${system}`,
      description: "Data is being sent via API",
    });
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Learning & Export</h2>
        <p className="text-muted-foreground">Export your processed data and provide feedback</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Data
          </h3>
          <div className="space-y-3">
            <Button onClick={() => handleExport("Excel")} variant="outline" className="w-full justify-start gap-3">
              <FileSpreadsheet className="h-4 w-4 text-success" />
              Export to Excel
            </Button>
            <Button onClick={() => handleExport("Word")} variant="outline" className="w-full justify-start gap-3">
              <FileText className="h-4 w-4 text-primary" />
              Export to Word Document
            </Button>
            <Button onClick={() => handleExport("PDF")} variant="outline" className="w-full justify-start gap-3">
              <FileText className="h-4 w-4 text-destructive" />
              Export to PDF
            </Button>
          </div>
        </div>

        <div className="border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-accent" />
            API Integration
          </h3>
          <div className="space-y-3">
            <Button onClick={() => handleApiExport("ERP")} variant="outline" className="w-full justify-start gap-3">
              <Share2 className="h-4 w-4 text-accent" />
              Send to ERP System
            </Button>
            <Button onClick={() => handleApiExport("BPSM")} variant="outline" className="w-full justify-start gap-3">
              <Share2 className="h-4 w-4 text-accent" />
              Send to BPSM System
            </Button>
            <Button onClick={() => handleApiExport("Custom")} variant="outline" className="w-full justify-start gap-3">
              <Share2 className="h-4 w-4 text-accent" />
              Custom API Endpoint
            </Button>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-xl p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <h3 className="font-semibold text-foreground mb-4">Processing Summary</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground mb-1">Documents Processed</p>
            <p className="text-2xl font-bold text-foreground">3</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground mb-1">Fields Extracted</p>
            <p className="text-2xl font-bold text-foreground">18</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground mb-1">Compliance Status</p>
            <p className="text-2xl font-bold text-success">Passed</p>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
          <p className="text-sm font-medium text-foreground mb-2">💡 Human-in-the-Loop Learning</p>
          <p className="text-sm text-muted-foreground">
            Your edits and approvals help improve the AI model's accuracy. The system learns from your corrections to provide better results in future processing.
          </p>
        </div>
      </div>
    </div>
  );
};
