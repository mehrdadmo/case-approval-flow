import { useEffect, useMemo, useState } from "react";
import { IconValidated, IconNodes, IconChevronStart } from "@/components/icons/SynapseIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ExtractedField {
  id: string;
  key: string;
  category: string;
  value: string;
}

interface ExtractedDoc {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fields: ExtractedField[];
}

const FIELDS: { key: string; category: string; value: (i: number) => string }[] = [
  { key: "نوع سند", category: "اطلاعات سند", value: () => "فاکتور فروش" },
  { key: "شماره فاکتور", category: "اطلاعات سند", value: (i) => `INV-${1000 + i}` },
  { key: "تاریخ فاکتور", category: "اطلاعات سند", value: () => "۱۴۰۳/۱۰/۲۵" },
  { key: "تاریخ سررسید", category: "اطلاعات سند", value: () => "۱۴۰۳/۱۱/۲۵" },
  { key: "نام تأمین‌کننده", category: "تأمین‌کننده", value: () => "Samsung Electronics Co., Ltd." },
  { key: "نشانی تأمین‌کننده", category: "تأمین‌کننده", value: () => "Gangnam-gu, Seoul, South Korea" },
  { key: "شناسه مالیاتی تأمین‌کننده", category: "تأمین‌کننده", value: () => "KR-12345678" },
  { key: "نام خریدار", category: "خریدار", value: () => "شرکت واردات ایرانیان" },
  { key: "نشانی خریدار", category: "خریدار", value: () => "تهران، ایران" },
  { key: "شرح کالا", category: "اقلام", value: () => "یخچال صنعتی" },
  { key: "کد تعرفه", category: "اقلام", value: () => "8418.10" },
  { key: "تعداد", category: "اقلام", value: () => "۱۲۰" },
  { key: "قیمت واحد", category: "اقلام", value: () => "350.00" },
  { key: "شماره سفارش خرید", category: "اقلام", value: () => "PO-2456" },
  { key: "جمع جزء", category: "مالی", value: () => "42,000.00" },
  { key: "مبلغ مالیات", category: "مالی", value: () => "4,200.00" },
  { key: "مبلغ کل", category: "مالی", value: () => "46,200.00" },
  { key: "واحد پول", category: "مالی", value: () => "USD" },
];

const buildDocs = (files: File[]): ExtractedDoc[] =>
  files.map((file, i) => ({
    id: `doc-${i}`,
    fileName: file.name,
    fileUrl: URL.createObjectURL(file),
    fileType: file.type,
    fields: FIELDS.map((f, j) => ({
      id: `f-${i}-${j}`,
      key: f.key,
      category: f.category,
      value: f.value(i),
    })),
  }));

interface Props {
  files: File[];
  onBack: () => void;
  onApprove: () => void;
}

export const ReviewWorkspace = ({ files, onBack, onApprove }: Props) => {
  const [docs, setDocs] = useState<ExtractedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setDocs(buildDocs(files));
      setLoading(false);
    }, 1200);
    return () => clearTimeout(t);
  }, [files]);

  const doc = docs[active];

  const grouped = useMemo(() => {
    if (!doc) return [] as { category: string; fields: ExtractedField[] }[];
    const map = new Map<string, ExtractedField[]>();
    doc.fields.forEach((f) => {
      map.set(f.category, [...(map.get(f.category) || []), f]);
    });
    return Array.from(map, ([category, fields]) => ({ category, fields }));
  }, [doc]);

  const update = (fieldId: string, value: string) => {
    setDocs((prev) =>
      prev.map((d, i) =>
        i === active ? { ...d, fields: d.fields.map((f) => (f.id === fieldId ? { ...f, value } : f)) } : d
      )
    );
  };

  if (loading || !doc) {
    return (
      <div dir="rtl" className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <IconNodes className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-semibold mt-6">در حال آماده‌سازی سند برای بررسی...</p>
      </div>
    );
  }

  const isPdf = doc.fileType === "application/pdf" || doc.fileName.toLowerCase().endsWith(".pdf");

  return (
    <div dir="rtl" className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* minimal top bar */}
      <div className="sticky top-0 z-20 h-14 px-4 flex items-center justify-between bg-background/90 backdrop-blur border-b border-border">
        <Button variant="ghost" size="sm" className="gap-1" onClick={onBack}>
          <IconChevronStart className="h-4 w-4 rotate-180" />
          بازگشت
        </Button>
        <span className="text-sm font-medium text-muted-foreground truncate">{doc.fileName}</span>
        <span className="w-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Document preview — right side in RTL, stays visible while scrolling */}
        <div className="lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] border-b lg:border-b-0 lg:border-l border-border bg-secondary/20">
          {docs.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-3 py-2 border-b border-border bg-background/60">
              {docs.map((d, i) => (
                <Button
                  key={d.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActive(i)}
                  className={cn("shrink-0", i === active && "bg-primary text-primary-foreground hover:bg-primary/90")}
                >
                  {d.fileName}
                </Button>
              ))}
            </div>
          )}
          <div className="h-full w-full p-3">
            {isPdf ? (
              <iframe src={doc.fileUrl} title={doc.fileName} className="w-full h-full rounded-lg border border-border bg-white" />
            ) : (
              <div className="w-full h-full overflow-auto rounded-lg border border-border bg-white">
                <img src={doc.fileUrl} alt={doc.fileName} className="w-full h-auto" />
              </div>
            )}
          </div>
        </div>

        {/* Extracted fields */}
        <div className="px-5 py-6">
          <h1 className="text-xl font-bold">اطلاعات استخراج‌شده</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            مقادیر را بررسی و در صورت نیاز اصلاح کنید، سپس تأیید نهایی را بزنید.
          </p>

          <div className="space-y-6">
            {grouped.map((g) => (
              <div key={g.category}>
                <h2 className="text-xs font-semibold text-muted-foreground mb-2">{g.category}</h2>
                <div className="space-y-2">
                  {g.fields.map((f) => (
                    <div key={f.id} className="grid grid-cols-[9rem_1fr] items-center gap-3">
                      <label className="text-sm text-muted-foreground truncate" htmlFor={f.id}>
                        {f.key}
                      </label>
                      <Input id={f.id} value={f.value} onChange={(e) => update(f.id, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pb-4">
            <Button size="lg" className="w-full gap-2" onClick={onApprove}>
              <IconValidated className="h-5 w-5" />
              تأیید اطلاعات و ادامه
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
