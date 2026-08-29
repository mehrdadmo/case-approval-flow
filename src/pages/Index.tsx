import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconDoc,
  IconProcessing,
  IconNewCase,
  IconNodes,
  IconReview,
  IconNeedsFix,
  IconExport,
  IconValidated,
  IconChevronStart,
} from "@/components/icons/SynapseIcons";
import synapseLogo from "@/assets/synapse-logo.png";
import { CaseSidebar } from "@/components/CaseSidebar";
import { UploadDialog } from "@/components/UploadDialog";
import { ProcessStage } from "@/components/stages/ProcessStage";
import { ReconciliationView } from "@/components/ReconciliationView";
import { ReviewWorkspace } from "@/components/ReviewWorkspace";
import { Button } from "@/components/ui/button";
import { useCases, CaseStatus, STATUS_META, CaseRecord } from "@/contexts/CasesContext";

const EmptyHome = ({ onNewCase }: { onNewCase: () => void }) => (
  <div dir="rtl" className="flex flex-col items-center justify-center py-24 text-center max-w-xl mx-auto px-6">
    <img src={synapseLogo} alt="لوگوی سیناپس مالی" className="h-24 w-24 object-contain mb-6" />
    <h1 className="text-3xl font-bold mb-2">سیناپس مالی</h1>
    <p className="text-muted-foreground mb-2">لایه هوشمند پردازش، تطبیق و کنترل اسناد مالی</p>
    <p className="text-sm text-muted-foreground mb-8">
      برای شروع، یک پرونده جدید ثبت کنید. سیستم اسناد شما را در پس‌زمینه پردازش می‌کند و هر زمان که آماده بررسی بود، در بخش «در انتظار بررسی» به شما اطلاع می‌دهد.
    </p>
    <Button size="lg" className="gap-2" onClick={onNewCase}>
      <IconNewCase className="h-5 w-5" />
      ثبت پرونده جدید
    </Button>
  </div>
);

const StatusBanner = ({ status }: { status: CaseStatus }) => {
  const meta = STATUS_META[status];
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-secondary/60">
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </div>
  );
};

const Index = () => {
  const { cases, updateCase } = useCases();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<CaseStatus>("review");
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeCase = useMemo(
    () => cases.find((c) => c.id === activeCaseId) || null,
    [cases, activeCaseId]
  );

  // Keep the sidebar tab in sync with the active case as its status evolves,
  // so the user stays on the case they are working on without losing context.
  useEffect(() => {
    if (activeCase && activeCase.status !== activeStatus) {
      setActiveStatus(activeCase.status);
    }
  }, [activeCase?.status]);

  // Filter cases for main-area list view
  const casesForTab = useMemo(
    () => cases.filter((c) => c.status === activeStatus),
    [cases, activeStatus]
  );

  const files = useMemo(() => activeCase?.files.map((f) => f.file) ?? [], [activeCase]);

  // Dedicated full-screen document review workspace (HITL)
  if (activeCase && activeCase.status === "review") {
    return (
      <ReviewWorkspace
        key={activeCase.id}
        files={files}
        onBack={() => setActiveCaseId(null)}
        onApprove={() => updateCase(activeCase.id, { status: "approved", reconciliation: undefined })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex" dir="rtl">
      <CaseSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        activeStatus={activeStatus}
        onStatusChange={(s) => { setActiveStatus(s); setActiveCaseId(null); }}
        activeCaseId={activeCaseId}
        onSelectCase={setActiveCaseId}
        onNewCase={() => setUploadOpen(true)}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        {!activeCase ? (
          <div className="flex-1 overflow-y-auto">
            {cases.length === 0 ? (
              <EmptyHome onNewCase={() => setUploadOpen(true)} />
            ) : (
              <div className="p-8 max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{STATUS_META[activeStatus].label}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {casesForTab.length} پرونده در این دسته • برای باز کردن، روی هر مورد کلیک کنید
                    </p>
                  </div>
                  <Button className="gap-2" onClick={() => setUploadOpen(true)}>
                    <IconNewCase className="h-4 w-4" />
                    پرونده جدید
                  </Button>
                </div>
                {activeStatus === "processing" && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
                    <IconProcessing className="h-5 w-5 text-primary animate-pulse" />
                    <p className="text-sm">
                      اسناد در حال پردازش هستند. نیازی به انتظار نیست — هنگامی که آماده بررسی شدند به بخش «در انتظار بررسی» منتقل می‌شوند.
                    </p>
                  </div>
                )}
                {activeStatus === "review" && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20 mb-4">
                    <IconReview className="h-5 w-5 text-warning" />
                    <p className="text-sm">پرونده‌های زیر آماده بررسی و تأیید هستند.</p>
                  </div>
                )}
                {activeStatus === "needsFix" && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20 mb-4">
                    <IconNeedsFix className="h-5 w-5 text-destructive" />
                    <p className="text-sm">پرونده‌های زیر نیازمند اصلاح یا بررسی مجدد هستند.</p>
                  </div>
                )}
                {activeStatus === "approved" && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/20 mb-4">
                    <IconValidated className="h-5 w-5 text-success" />
                    <p className="text-sm">پرونده‌های زیر تأیید شده‌اند.</p>
                  </div>
                )}
                {activeStatus === "exported" && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-4">
                    <IconExport className="h-5 w-5 text-accent" />
                    <p className="text-sm">از این پرونده‌ها خروجی گرفته شده است.</p>
                  </div>
                )}

                {casesForTab.length === 0 ? (
                  <div className="text-center py-16 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                    پرونده‌ای در این دسته وجود ندارد.
                  </div>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {casesForTab.map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => setActiveCaseId(c.id)}
                          className="w-full text-right p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <IconDoc className="h-4 w-4 text-primary shrink-0" />
                                <span className="font-semibold truncate">{c.invoiceNumber}</span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{c.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-1">{c.files.length} سند</p>
                            </div>
                            <StatusBanner status={c.status} />
                          </div>
                          <div className="mt-3 flex items-center justify-end text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>باز کردن</span>
                            <IconChevronStart className="h-3.5 w-3.5" />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-4 border-b border-border bg-card/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={synapseLogo} alt="سیناپس مالی" className="h-10 w-10 object-contain" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold">{activeCase.invoiceNumber}</h1>
                    <StatusBanner status={activeCase.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activeCase.files.length} سند • {activeCase.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeCase.status === "needsFix" && (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      updateCase(activeCase.id, {
                        status: "approved",
                        reconciliation: activeCase.reconciliation
                          ? { ...activeCase.reconciliation, overall: "approved" }
                          : undefined,
                      })
                    }
                  >
                    <IconValidated className="h-4 w-4" />
                    تأیید پرونده
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setActiveCaseId(null)}>
                  بازگشت به لیست
                </Button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto bg-card">
              {activeCase.status === "processing" && (
                <div className="flex flex-col items-center justify-center py-24" dir="rtl">
                  <IconProcessing className="h-12 w-12 text-primary animate-pulse" />
                  <p className="text-lg font-semibold mt-6">پرونده در حال پردازش است</p>
                  <p className="text-sm text-muted-foreground mt-2">هنگام آماده شدن، در بخش «در انتظار بررسی» قرار می‌گیرد.</p>
                </div>
              )}

              {activeCase.status === "review" && (
                <ProcessStage
                  key={activeCase.id}
                  files={files}
                  onDataExtracted={() => { /* no-op */ }}
                  onApprove={() => {
                    // Move into reconciliation flow — keep the case open so the user
                    // sees the reconciliation result immediately on the main page.
                    updateCase(activeCase.id, { status: "approved", reconciliation: undefined });
                  }}
                />
              )}

              {(activeCase.status === "approved" || activeCase.status === "needsFix" || activeCase.status === "exported") && (
                <ReconciliationView caseRecord={activeCase} />
              )}
            </div>
          </div>
        )}
      </main>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
};

export default Index;
