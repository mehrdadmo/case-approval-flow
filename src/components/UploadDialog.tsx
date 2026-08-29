import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { IconDoc, IconExtract, IconTextDoc, IconValidated, IconProcessing, IconNodes, IconSheet } from "@/components/icons/SynapseIcons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCases, CaseFile } from "@/contexts/CasesContext";
import sampleInvoice from "@/assets/sample-invoice.jpg";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Phase = "upload" | "processing" | "submitted";

const STEPS = [
  "دریافت اسناد",
  "تشخیص نوع سند",
  "استخراج اطلاعات",
  "ارتباط دادن اسناد",
  "آماده‌سازی بررسی",
];

const toCaseFile = (f: File): CaseFile => ({
  name: f.name,
  type: f.type,
  size: f.size,
  file: f,
  url: URL.createObjectURL(f),
});

export const UploadDialog = ({ open, onOpenChange }: UploadDialogProps) => {
  const { addCase } = useCases();
  const [phase, setPhase] = useState<Phase>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [taxFiles, setTaxFiles] = useState<File[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      // reset after close
      setTimeout(() => {
        setPhase("upload");
        setFiles([]);
        setTaxFiles([]);
        setInvoiceNumber("");
        setStepIndex(0);
      }, 200);
    }
  }, [open]);

  useEffect(() => {
    if (phase !== "processing") return;
    if (stepIndex >= STEPS.length) {
      // Finalize: create case, move to submitted
      addCase(files.map(toCaseFile), invoiceNumber.trim(), taxFiles.map(toCaseFile));
      setPhase("submitted");
      return;
    }
    const t = setTimeout(() => setStepIndex((i) => i + 1), 800);
    return () => clearTimeout(t);
  }, [phase, stepIndex, files, taxFiles, invoiceNumber, addCase]);

  const handleFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => [...prev, ...incoming]);
  }, []);

  const getIcon = (f: File) => {
    if (f.type === "application/pdf") return IconTextDoc;
    if (f.type.startsWith("image/")) return IconExtract;
    return IconDoc;
  };

  const handleSubmit = () => {
    if (files.length === 0) return;
    setStepIndex(0);
    setPhase("processing");
  };

  const handleSample = async () => {
    const res = await fetch(sampleInvoice);
    const blob = await res.blob();
    const sampleFile = new File([blob], "فاکتور-نمونه.jpg", { type: blob.type || "image/jpeg" });
    setFiles([sampleFile]);
    if (!invoiceNumber.trim()) setInvoiceNumber("INV-1001");
    setStepIndex(0);
    setPhase("processing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-xl">
        {phase === "upload" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-right">فاکتور خود را آپلود کنید</DialogTitle>
              <DialogDescription className="text-right">
                برای بررسی کامل‌تر، می‌توانید اسناد مرتبط مانند سفارش خرید و رسید انبار را نیز اضافه کنید.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">شماره فاکتور (اختیاری)</label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="مثال: INV-2567"
                />
              </div>

              <div
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(Array.from(e.dataTransfer.files));
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 transition-all text-center",
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconNodes className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">فایل‌ها را اینجا رها کنید یا انتخاب کنید</p>
                  <p className="text-xs text-muted-foreground">PDF، تصویر یا Word</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/*,.doc,.docx"
                    onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                    className="hidden"
                    id="upload-dialog-input"
                  />
                  <label htmlFor="upload-dialog-input">
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <span className="cursor-pointer">انتخاب فایل</span>
                    </Button>
                  </label>
                </div>
              </div>

              {files.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {files.map((f, i) => {
                    const Icon = getIcon(f);
                    return (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm truncate">{f.name}</span>
                        </div>
                        <button
                          onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                          className="h-6 w-6 rounded hover:bg-destructive/10 flex items-center justify-center"
                        >
                          <X className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-start gap-2">
                <Button onClick={handleSubmit} disabled={files.length === 0} className="gap-2">
                  <IconDoc className="h-4 w-4" />
                  ثبت پرونده
                </Button>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>انصراف</Button>
              </div>

              <div className="relative py-1">
                <div className="h-px bg-border" />
              </div>

              <div className="text-center space-y-1.5">
                <p className="text-sm text-muted-foreground">هنوز پرونده‌ای برای بررسی ندارید؟</p>
                <button
                  onClick={handleSample}
                  className="text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  تست با یک پرونده نمونه
                </button>
              </div>
            </div>
          </>
        )}

        {phase === "processing" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-right">در حال آماده‌سازی پرونده</DialogTitle>
              <DialogDescription className="text-right">
                لطفاً صبر کنید تا مراحل اولیه انجام شود.
              </DialogDescription>
            </DialogHeader>
            <ul className="space-y-2.5 py-2">
              {STEPS.map((s, i) => {
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <li key={s} className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg transition-colors",
                    done && "bg-success/5",
                    active && "bg-primary/5"
                  )}>
                    {done ? (
                      <IconValidated className="h-5 w-5 text-success" />
                    ) : active ? (
                      <IconProcessing className="h-5 w-5 text-primary animate-pulse" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted" />
                    )}
                    <span className={cn(
                      "text-sm",
                      done ? "text-foreground font-medium" : active ? "text-primary font-medium" : "text-muted-foreground"
                    )}>
                      {done && "✓ "}{s}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {phase === "submitted" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-right flex items-center gap-2">
                <IconValidated className="h-6 w-6 text-success" />
                پرونده جدید ثبت شد
              </DialogTitle>
              <DialogDescription className="text-right">
                پرونده در بخش «در حال پردازش» قرار گرفت. هنگامی که آماده بررسی شد، به بخش «در انتظار بررسی» منتقل می‌شود. شما می‌توانید همین حالا پرونده جدیدی ثبت کنید.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-start gap-2 pt-2">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  setTimeout(() => {
                    setPhase("upload");
                    setFiles([]);
                    setTaxFiles([]);
                    setInvoiceNumber("");
                    setStepIndex(0);
                  }, 50);
                }}
              >
                بستن
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPhase("upload");
                  setFiles([]);
                  setTaxFiles([]);
                  setInvoiceNumber("");
                  setStepIndex(0);
                }}
              >
                ثبت پرونده جدید
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};