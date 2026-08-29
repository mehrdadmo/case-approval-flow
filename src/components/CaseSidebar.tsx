import { useMemo, useState } from "react";
import {
  IconSearch,
  IconNewCase,
  IconProcessing,
  IconReview,
  IconValidated,
  IconNeedsFix,
  IconExport,
  IconPanelCollapse,
  IconPanelExpand,
} from "@/components/icons/SynapseIcons";
import synapseLogo from "@/assets/synapse-logo.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCases, CaseStatus, STATUS_META } from "@/contexts/CasesContext";

interface CaseSidebarProps {
  activeStatus: CaseStatus;
  onStatusChange: (s: CaseStatus) => void;
  activeCaseId: string | null;
  onSelectCase: (id: string | null) => void;
  onNewCase: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const TAB_ICON: Record<CaseStatus, any> = {
  processing: IconProcessing,
  review: IconReview,
  approved: IconValidated,
  needsFix: IconNeedsFix,
  exported: IconExport,
};

const TAB_ORDER: CaseStatus[] = ["processing", "review", "needsFix", "approved", "exported"];

export const CaseSidebar = ({ activeStatus, onStatusChange, activeCaseId, onSelectCase, onNewCase, collapsed, onToggleCollapsed }: CaseSidebarProps) => {
  const { cases } = useCases();
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<CaseStatus, number> = { processing: 0, review: 0, needsFix: 0, approved: 0, exported: 0 };
    cases.forEach((cs) => { c[cs.status] += 1; });
    return c;
  }, [cases]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases
      .filter((c) => c.status === activeStatus)
      .filter((c) => !q || c.invoiceNumber.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
  }, [cases, activeStatus, query]);

  if (collapsed) {
    return (
      <aside dir="rtl" className="w-14 shrink-0 border-l border-border bg-card/60 backdrop-blur-sm flex flex-col h-screen sticky top-0 items-center py-3 gap-2">
        <Button variant="ghost" size="icon" onClick={onToggleCollapsed} title="باز کردن سایدبار">
          <IconPanelExpand className="h-5 w-5" />
        </Button>
        <Button size="icon" onClick={onNewCase} title="پرونده جدید">
          <IconNewCase className="h-5 w-5" />
        </Button>
        <div className="w-full h-px bg-border my-1" />
        {TAB_ORDER.map((s) => {
          const Icon = TAB_ICON[s];
          const meta = STATUS_META[s];
          const isActive = activeStatus === s;
          return (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              title={`${meta.label} (${counts[s]})`}
              className={cn(
                "relative h-9 w-9 flex items-center justify-center rounded-lg transition-colors",
                isActive ? "bg-primary/10 text-primary" : "hover:bg-secondary/60 text-muted-foreground"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", isActive && s === "processing" && "animate-pulse")} />
              {counts[s] > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {counts[s]}
                </span>
              )}
            </button>
          );
        })}
      </aside>
    );
  }

  return (
    <aside dir="rtl" className="w-80 shrink-0 border-l border-border bg-card/60 backdrop-blur-sm flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <img src={synapseLogo} alt="لوگوی سیناپس مالی" className="h-9 w-9 object-contain shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground leading-tight">سیناپس مالی</p>
            <p className="text-[11px] text-muted-foreground leading-tight">پردازش و تطبیق اسناد مالی</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleCollapsed} title="جمع کردن سایدبار">
            <IconPanelCollapse className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={onNewCase} className="w-full gap-2" size="sm">
          <IconNewCase className="h-4 w-4" />
          پرونده جدید
        </Button>
      </div>

      <div className="p-3 border-b border-border">
        <div className="relative">
          <IconSearch className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جست‌وجوی شماره فاکتور..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-8 text-sm"
          />
        </div>
      </div>

      <nav className="p-2 border-b border-border space-y-1">
        {TAB_ORDER.map((s) => {
          const Icon = TAB_ICON[s];
          const meta = STATUS_META[s];
          const isActive = activeStatus === s;
          return (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary/60 text-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className={cn("h-[18px] w-[18px]", isActive && s === "processing" && "animate-pulse")} />
                {meta.label}
              </span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", isActive ? "bg-primary/20" : "bg-muted")}>
                {counts[s]}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-8 px-3">
            پرونده‌ای در این دسته وجود ندارد.
          </div>
        ) : (
          <ul className="space-y-1">
            {filtered.map((c) => {
              const isActive = activeCaseId === c.id;
              const meta = STATUS_META[c.status];
              return (
                <li key={c.id}>
                  <button
                    onClick={() => onSelectCase(c.id)}
                    className={cn(
                      "w-full text-right px-3 py-2 rounded-lg transition-colors border",
                      isActive ? "bg-primary/10 border-primary/30" : "border-transparent hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">{c.invoiceNumber}</span>
                      <span className={cn("h-2 w-2 rounded-full shrink-0", meta.dot)} />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {c.files.length} سند • {meta.label}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};