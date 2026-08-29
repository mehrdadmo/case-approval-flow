import { useEffect, useState } from "react";
import {
  IconNodes,
  IconValidated,
  IconNeedsFix,
  IconSheet,
  IconTextDoc,
  IconCode,
  IconReopen,
} from "@/components/icons/SynapseIcons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CaseRecord, useCases } from "@/contexts/CasesContext";
import { toast } from "sonner";

interface ReconciliationViewProps {
  caseRecord: CaseRecord;
}

const DEFAULT_CHECKS: { icon: "ok" | "warn"; text: string }[] = [
  { icon: "ok", text: "تامین کننده تایید شد" },
  { icon: "ok", text: "شماره سفارش تطبیق دارد" },
  { icon: "warn", text: "مبلغ فاکتور ۵٪ بیشتر است" },
  { icon: "warn", text: "۵۰ عدد اختلاف موجودی وجود دارد" },
];

const TAX_ROWS: { field: string; invoice: string; portal: string; match: boolean }[] = [
  { field: "شماره فاکتور", invoice: "INV-2567", portal: "INV-2567", match: true },
  { field: "شناسه ملی فروشنده", invoice: "۱۴۰۰۳۲۵۶۷۸۹", portal: "۱۴۰۰۳۲۵۶۷۸۹", match: true },
  { field: "تاریخ صدور", invoice: "۱۴۰۴/۰۸/۰۹", portal: "۱۴۰۴/۰۸/۱۰", match: false },
  { field: "مبلغ کل پیش از مالیات", invoice: "۴۲٬۰۰۰٬۰۰۰ ریال", portal: "۴۰٬۰۰۰٬۰۰۰ ریال", match: false },
  { field: "نرخ مالیات بر ارزش افزوده", invoice: "۹٪", portal: "۹٪", match: true },
  { field: "مبلغ مالیات", invoice: "۳٬۷۸۰٬۰۰۰ ریال", portal: "۳٬۶۰۰٬۰۰۰ ریال", match: false },
  { field: "مبلغ نهایی قابل پرداخت", invoice: "۴۵٬۷۸۰٬۰۰۰ ریال", portal: "۴۳٬۶۰۰٬۰۰۰ ریال", match: false },
];

export const ReconciliationView = ({ caseRecord }: ReconciliationViewProps) => {
  const { updateCase } = useCases();
  const [checking, setChecking] = useState(!caseRecord.reconciliation);
  const hasTaxExport = (caseRecord.taxFiles?.length ?? 0) > 0;

  useEffect(() => {
    if (caseRecord.reconciliation) { setChecking(false); return; }
    setChecking(true);
    const t = setTimeout(() => {
      const taxRows = hasTaxExport ? TAX_ROWS : [];
      const checks = [
        ...DEFAULT_CHECKS,
        ...(hasTaxExport
          ? [
              taxRows.every((r) => r.match)
                ? { icon: "ok" as const, text: "فاکتور با خروجی سامانه مؤدیان تطبیق دارد" }
                : {
                    icon: "warn" as const,
                    text: `${taxRows.filter((r) => !r.match).length} مغایرت با خروجی سامانه مؤدیان یافت شد`,
                  },
            ]
          : []),
      ];
      const hasWarn = checks.some((c) => c.icon === "warn");
      updateCase(caseRecord.id, {
        reconciliation: {
          overall: hasWarn ? "needsFix" : "approved",
          checks,
          tax: { available: hasTaxExport, rows: taxRows },
        },
        status: hasWarn ? "needsFix" : "approved",
      });
      setChecking(false);
    }, 2200);
    return () => clearTimeout(t);
  }, [caseRecord.id, caseRecord.reconciliation, hasTaxExport, updateCase]);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center py-24" dir="rtl">
        <IconNodes className="h-12 w-12 text-primary animate-pulse" />
        <p className="text-lg font-semibold mt-6">در حال بررسی ارتباط بین اسناد...</p>
        <p className="text-sm text-muted-foreground mt-2">تطبیق فاکتور، سفارش خرید و رسید انبار</p>
      </div>
    );
  }

  const rec = caseRecord.reconciliation!;
  const needsFix = rec.overall === "needsFix";
  const taxRows = rec.tax?.rows ?? [];

  const handleExport = (format: "excel" | "docx" | "json") => {
    updateCase(caseRecord.id, { status: "exported" });
    toast.success(`خروجی ${format === "excel" ? "Excel" : format === "docx" ? "Word" : "JSON"} آماده شد`);
  };

  return (
    <div dir="rtl" className="p-6 space-y-6">
      <div className={cn(
        "rounded-2xl p-6 border",
        needsFix ? "bg-warning/5 border-warning/30" : "bg-success/5 border-success/30"
      )}>
        <div className="flex items-center gap-3">
          {needsFix ? (
            <IconNeedsFix className="h-8 w-8 text-warning" />
          ) : (
            <IconValidated className="h-8 w-8 text-success" />
          )}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">نتیجه بررسی پرونده</p>
            <h2 className={cn("text-2xl font-bold", needsFix ? "text-warning" : "text-success")}>
              {needsFix ? "⚠ نیاز به بررسی" : "✓ تأیید کامل"}
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => updateCase(caseRecord.id, { status: "review", reconciliation: undefined })}
          >
            <IconReopen className="h-4 w-4" />
            بازگشت به بررسی و اصلاح
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">بررسی‌ها</h3>
        <ul className="space-y-2">
          {rec.checks.map((c, i) => (
            <li key={i} className={cn(
              "flex items-center gap-3 p-3 rounded-lg border",
              c.icon === "ok" ? "border-success/20 bg-success/5" : "border-warning/20 bg-warning/5"
            )}>
              {c.icon === "ok" ? (
                <IconValidated className="h-5 w-5 text-success shrink-0" />
              ) : (
                <IconNeedsFix className="h-5 w-5 text-warning shrink-0" />
              )}
              <span className="text-sm">{c.icon === "ok" ? "✓ " : "⚠ "}{c.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-semibold mb-3">دریافت خروجی</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handleExport("excel")}>
            <IconSheet className="h-4 w-4 text-success" />
            خروجی Excel
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleExport("docx")}>
            <IconTextDoc className="h-4 w-4 text-primary" />
            خروجی Word
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleExport("json")}>
            <IconCode className="h-4 w-4 text-accent" />
            خروجی JSON
          </Button>
        </div>
      </div>
    </div>
  );
};