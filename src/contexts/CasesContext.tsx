import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type CaseStatus = "processing" | "review" | "needsFix" | "approved" | "exported";

export interface CaseFile {
  name: string;
  type: string;
  size: number;
  file: File;
  url: string;
}

export interface CaseRecord {
  id: string;
  invoiceNumber: string;
  title: string;
  createdAt: number;
  status: CaseStatus;
  files: CaseFile[];
  /** خروجی سامانه مؤدیان برای بررسی مغایرت مالیاتی */
  taxFiles: CaseFile[];
  reconciliation?: {
    overall: "needsFix" | "approved";
    checks: { icon: "ok" | "warn"; text: string }[];
    tax?: {
      available: boolean;
      rows: { field: string; invoice: string; portal: string; match: boolean }[];
    };
  };
}

interface CasesContextValue {
  cases: CaseRecord[];
  addCase: (files: CaseFile[], invoiceNumber: string, taxFiles?: CaseFile[]) => CaseRecord;
  updateCase: (id: string, updates: Partial<CaseRecord>) => void;
  removeCase: (id: string) => void;
}

const CasesContext = createContext<CasesContextValue | null>(null);

let counter = 1000;

export const CasesProvider = ({ children }: { children: ReactNode }) => {
  const [cases, setCases] = useState<CaseRecord[]>([]);

  const updateCase = useCallback((id: string, updates: Partial<CaseRecord>) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const addCase = useCallback(
    (files: CaseFile[], invoiceNumber: string, taxFiles: CaseFile[] = []) => {
      counter += 1;
      const id = `case-${counter}`;
      const newCase: CaseRecord = {
        id,
        invoiceNumber: invoiceNumber || `INV-${counter}`,
        title: files[0]?.name?.replace(/\.[^.]+$/, "") || `پرونده ${counter}`,
        createdAt: Date.now(),
        status: "processing",
        files,
        taxFiles,
      };
      setCases((prev) => [newCase, ...prev]);

      // Simulate backend extraction: move to review after ~6s
      setTimeout(() => {
        setCases((prev) =>
          prev.map((c) => (c.id === id && c.status === "processing" ? { ...c, status: "review" } : c))
        );
      }, 6000);

      return newCase;
    },
    []
  );

  const removeCase = useCallback((id: string) => {
    setCases((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <CasesContext.Provider value={{ cases, addCase, updateCase, removeCase }}>
      {children}
    </CasesContext.Provider>
  );
};

export const useCases = () => {
  const ctx = useContext(CasesContext);
  if (!ctx) throw new Error("useCases must be used within CasesProvider");
  return ctx;
};

export const STATUS_META: Record<CaseStatus, { label: string; color: string; dot: string }> = {
  processing: { label: "در حال پردازش", color: "text-primary", dot: "bg-primary" },
  review: { label: "در انتظار بررسی", color: "text-warning", dot: "bg-warning" },
  needsFix: { label: "نیازمند اصلاح", color: "text-destructive", dot: "bg-destructive" },
  approved: { label: "تأیید شده", color: "text-success", dot: "bg-success" },
  exported: { label: "خروجی گرفته شده", color: "text-accent", dot: "bg-accent" },
};