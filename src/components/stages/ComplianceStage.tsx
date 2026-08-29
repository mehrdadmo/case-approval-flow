import { useState } from "react";
import { CheckCircle2, AlertTriangle, FileCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ComplianceStageProps {
  extractedData: any[];
  onComplete: (data: any) => void;
}

const complianceFields = [
  { 
    id: "standardGoods", 
    label: "Standard Goods Validation", 
    labelPersian: "کالاهای استاندارد اجباری",
    description: "Checks whether the HS Code is subject to mandatory Iranian standards and validates product description, technical specifications, model, and standard certificates against national compliance requirements." 
  },
  { 
    id: "weightQuantity", 
    label: "Weight & Quantity Validation", 
    labelPersian: "اعتبارسنجی وزن و تعداد",
    description: "Cross-checks net and gross weight, packaging details, units of measure, and item quantities across invoice, packing list, and shipping documents to detect inconsistencies." 
  },
  { 
    id: "shippingData", 
    label: "Shipping Data Validation", 
    labelPersian: "اعتبارسنجی اطلاعات حمل",
    description: "Validates Bill of Lading details, container and seal numbers, ports of loading and discharge, and vessel/voyage information across all logistics documents." 
  },
];

interface ComplianceField {
  id: string;
  label: string;
  labelPersian: string;
  description: string;
}

const ComplianceFieldItem = ({ 
  field, 
  isSelected, 
  onToggle 
}: { 
  field: ComplianceField; 
  isSelected: boolean; 
  onToggle: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border hover:bg-secondary/20 transition-colors">
      <div className="flex items-start gap-3 p-4">
        <Checkbox
          id={field.id}
          checked={isSelected}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1">
          <label htmlFor={field.id} className="cursor-pointer">
            <p className="font-medium text-foreground">{field.label}</p>
            <p className="text-sm text-muted-foreground/80">({field.labelPersian})</p>
          </label>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-2 transition-colors">
              {isOpen ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Hide details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show details
                </>
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {field.description}
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};

export const ComplianceStage = ({ extractedData, onComplete }: ComplianceStageProps) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [complianceReport, setComplianceReport] = useState<any>(null);
  const { toast } = useToast();

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleGenerateReport = () => {
    if (selectedFields.length === 0) {
      toast({
        title: "No fields selected",
        description: "Please select at least one field to check for compliance",
        variant: "destructive",
      });
      return;
    }

    const today = new Date();
    const reportId = `COMP-${today.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    const checkResults = [
      { id: 1, item: "کد تعرفه (HS Code)", result: "✅ منطبق", description: "841810 – در فهرست استاندارد اجباری" },
      { id: 2, item: "نام کالا", result: "✅ منطبق", description: "Refrigerator مطابق با کد تعرفه" },
      { id: 3, item: "گواهی استاندارد", result: selectedFields.includes("iso") ? "✅ منطبق" : "⚠️ ناقص", description: selectedFields.includes("iso") ? "گواهی ISIRI پیوست شده" : "گواهی ISIRI پیوست نشده" },
      { id: 4, item: "تعداد کالا (Qty)", result: "✅ منطبق", description: "۱۲۰ عدد در هر دو سند" },
      { id: 5, item: "وزن کل", result: "⚠️ اختلاف جزئی", description: "فاکتور: ۸۲۰ کیلو / پکینگ: ۸۳۰ کیلو" },
      { id: 6, item: "وزن ناخالص حمل", result: "✅ منطبق", description: "با بارنامه تطبیق دارد" },
      { id: 7, item: "کشور مبدأ", result: "✅ منطبق", description: "کره جنوبی" },
      { id: 8, item: "صادرکننده", result: "✅ منطبق", description: "Samsung Electronics" },
      { id: 9, item: "واردکننده", result: "✅ منطبق", description: "با اظهارنامه یکی است" },
      { id: 10, item: "ارزش کل فاکتور", result: "✅ منطبق", description: "۴۲٬۰۰۰ دلار – همان ارزش اظهارشده" },
      { id: 11, item: "ارز معامله", result: "✅ منطبق", description: "USD" },
      { id: 12, item: "شرایط تحویل (Incoterm)", result: "✅ منطبق", description: "CIF Busan" },
      { id: 13, item: "بندر مبدأ", result: selectedFields.includes("iranPort") ? "✅ منطبق" : "⚠️ بررسی نشده", description: "Busan" },
      { id: 14, item: "بندر مقصد", result: selectedFields.includes("iranPort") ? "✅ منطبق" : "⚠️ بررسی نشده", description: "Bandar Abbas" },
      { id: 15, item: "تاریخ حمل و صدور", result: "✅ منطقی", description: "حمل ۱ روز پس از صدور فاکتور" },
      { id: 16, item: "شماره کانتینر", result: "✅ منطبق", description: "SMLU1234567" },
      { id: 17, item: "بیمه حمل", result: "✅ موجود", description: "پوشش کامل تا بندر مقصد" },
      { id: 18, item: "مجوز واردات", result: "⚠️ بررسی نشده", description: "نیاز به تطبیق با سامانه مجوزها" },
    ];

    const documents = [
      { type: "فاکتور تجاری (Invoice)", number: "INV-2567", date: "۱۴۰۴/۰۸/۰۹", description: "صادرکننده: Samsung Electronics" },
      { type: "لیست بسته‌بندی (Packing List)", number: "PL-1023", date: "۱۴۰۴/۰۸/۰۹", description: "شامل ۴ بسته، وزن ناخالص ۸۸۰ کیلوگرم" },
      { type: "بارنامه (Bill of Lading)", number: "BOL-5587", date: "۱۴۰۴/۰۸/۱۰", description: "حمل از بندر بوسان به بندرعباس" },
      { type: "گواهی استاندارد (ISIRI)", number: "ISIRI-1562", date: "۱۴۰۴/۰۸/۱۱", description: "الزامی برای کد تعرفه ۸۴۱۸۱۰" },
    ];

    const recommendations = [
      { priority: "🔴 بالا", action: "پیوست گواهی استاندارد ISIRI 1562", responsible: "مدیر واردات", deadline: "فوری" },
      { priority: "🟡 متوسط", action: "بررسی اختلاف وزن در فاکتور و لیست بسته‌بندی", responsible: "کارشناس لجستیک", deadline: "۲ روز" },
      { priority: "🟢 پایین", action: "تکمیل بررسی مجوز واردات", responsible: "کارشناس بازرگانی", deadline: "تا پایان هفته" },
    ];

    const matchedFields = checkResults.filter(c => c.result.includes("✅")).length;
    const totalFields = checkResults.length;
    const compliancePercentage = Math.round((matchedFields / totalFields) * 100);
    const discrepancies = checkResults.filter(c => c.result.includes("⚠️") || c.result.includes("❌")).length;

    const report = {
      reportId,
      date: today.toLocaleDateString('fa-IR'),
      selectedFields,
      checkResults,
      documents,
      recommendations,
      summary: {
        totalDocuments: 4,
        totalFields,
        matchedFields,
        discrepancies,
        compliancePercentage,
        status: compliancePercentage >= 90 ? "✅ منطبق کامل" : compliancePercentage >= 70 ? "⚠️ نیاز به اصلاح جزئی" : "❌ نیاز به اصلاح اساسی"
      }
    };

    setComplianceReport(report);
    toast({
      title: "گزارش تطبیق تولید شد",
      description: "وضعیت انطباق و پیشنهادات را بررسی کنید",
    });
  };

  const handleComplete = () => {
    if (!complianceReport) {
      toast({
        title: "Generate report first",
        description: "Please generate a compliance report before continuing",
        variant: "destructive",
      });
      return;
    }

    onComplete(complianceReport);
    toast({
      title: "Compliance check complete",
      description: "Moving to learning stage",
    });
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Compliance Verification</h2>
        <p className="text-muted-foreground">Select compliance references and generate report</p>
      </div>

      <div className="mb-8">
        <div className="border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Select Fields to Check</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Choose which compliance fields you want to verify
          </p>
          <div className="space-y-4">
            {complianceFields.map((field) => (
              <ComplianceFieldItem
                key={field.id}
                field={field}
                isSelected={selectedFields.includes(field.id)}
                onToggle={() => toggleField(field.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <Button onClick={handleGenerateReport} size="lg" className="gap-2 mb-8">
        <FileCheck className="h-4 w-4" />
        Generate Compliance Report
      </Button>

      {complianceReport && (
        <div className="border border-border rounded-xl overflow-hidden" dir="rtl">
          {/* Header */}
          <div className="bg-primary/10 px-6 py-4 border-b border-border">
            <h3 className="text-xl font-bold text-foreground mb-2">گزارش تطبیق اسناد بازرگانی</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <p>شناسه گزارش: {complianceReport.reportId}</p>
              <p>تاریخ تهیه: {complianceReport.date}</p>
              <p>نوع بررسی: تطبیق اسناد واردات – بررسی انطباق با استاندارد و مقادیر</p>
              <p>تهیه‌کننده: سیستم Synapse (نسخه بتا)</p>
            </div>
          </div>

          {/* Summary Status */}
          <div className="p-6 border-b border-border">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              🧠 خلاصه وضعیت
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium text-foreground bg-muted/50">مورد</td>
                    <td className="p-3 font-medium text-foreground bg-muted/50">مقدار</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">تعداد اسناد بررسی‌شده</td>
                    <td className="p-3 text-muted-foreground">{complianceReport.summary.totalDocuments} سند</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">تعداد فیلدهای بررسی‌شده</td>
                    <td className="p-3 text-muted-foreground">{complianceReport.summary.totalFields} فیلد</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">فیلدهای منطبق</td>
                    <td className="p-3 text-success">{complianceReport.summary.matchedFields}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">فیلدهای دارای مغایرت</td>
                    <td className="p-3 text-warning">{complianceReport.summary.discrepancies}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">درصد انطباق کلی</td>
                    <td className="p-3 text-success font-bold">✅ {complianceReport.summary.compliancePercentage}٪</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground">وضعیت نهایی</td>
                    <td className="p-3 font-semibold">{complianceReport.summary.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Documents Reviewed */}
          <div className="p-6 border-b border-border">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              📂 اسناد بررسی‌شده
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="p-3 text-right font-medium text-foreground">نوع سند</th>
                    <th className="p-3 text-right font-medium text-foreground">شماره / شناسه</th>
                    <th className="p-3 text-right font-medium text-foreground">تاریخ</th>
                    <th className="p-3 text-right font-medium text-foreground">توضیح</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceReport.documents.map((doc: any, index: number) => (
                    <tr key={index} className="border-b border-border">
                      <td className="p-3 text-foreground">{doc.type}</td>
                      <td className="p-3 text-muted-foreground">{doc.number}</td>
                      <td className="p-3 text-muted-foreground">{doc.date}</td>
                      <td className="p-3 text-sm text-muted-foreground">{doc.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Check Results */}
          <div className="p-6 border-b border-border">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              🔍 نتایج بررسی تطبیق
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="p-3 text-right font-medium text-foreground">ردیف</th>
                    <th className="p-3 text-right font-medium text-foreground">مورد بررسی</th>
                    <th className="p-3 text-right font-medium text-foreground">نتیجه</th>
                    <th className="p-3 text-right font-medium text-foreground">توضیح</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceReport.checkResults.map((check: any) => (
                    <tr key={check.id} className="border-b border-border">
                      <td className="p-3 text-muted-foreground">{check.id}</td>
                      <td className="p-3 text-foreground">{check.item}</td>
                      <td className="p-3 font-medium">{check.result}</td>
                      <td className="p-3 text-sm text-muted-foreground">{check.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="p-6 border-b border-border bg-muted/20">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              ⚖️ جمع‌بندی وضعیت
            </h4>
            <div className="space-y-2 text-foreground">
              <p>• تعداد کل مغایرت‌ها: <span className="font-bold text-warning">{complianceReport.summary.discrepancies} مورد</span></p>
              <p>• شدت مغایرت: <span className="font-bold">متوسط</span></p>
              <p>• ریسک بازرگانی: <span className="font-bold text-success">پایین</span></p>
              <p className="mt-4 text-sm text-muted-foreground">
                اکثر اطلاعات اسناد هم‌خوان هستند. تنها گواهی استاندارد ISIRI و اختلاف وزن کل نیاز به بررسی دارد.
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-6 border-b border-border">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              📘 پیشنهادات اصلاحی
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="p-3 text-right font-medium text-foreground">اولویت</th>
                    <th className="p-3 text-right font-medium text-foreground">اقدام پیشنهادی</th>
                    <th className="p-3 text-right font-medium text-foreground">مسئول</th>
                    <th className="p-3 text-right font-medium text-foreground">مهلت</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceReport.recommendations.map((rec: any, index: number) => (
                    <tr key={index} className="border-b border-border">
                      <td className="p-3 font-medium">{rec.priority}</td>
                      <td className="p-3 text-foreground">{rec.action}</td>
                      <td className="p-3 text-muted-foreground">{rec.responsible}</td>
                      <td className="p-3 text-muted-foreground">{rec.deadline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Conclusion */}
          <div className="p-6 bg-primary/5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              🧩 نتیجه نهایی سیستم
            </h4>
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-foreground leading-relaxed">
                «محموله از نظر انطباق اسناد در وضعیت قابل قبول با نیاز به اصلاح جزئی قرار دارد.
                لطفاً مدارک تکمیلی استاندارد و وزن واقعی را پیش از ترخیص ارائه نمایید.»
              </p>
            </div>
          </div>
        </div>
      )}

      {complianceReport && (
        <div className="mt-8 flex justify-end">
          <Button onClick={handleComplete} size="lg" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Complete & Continue
          </Button>
        </div>
      )}
    </div>
  );
};
