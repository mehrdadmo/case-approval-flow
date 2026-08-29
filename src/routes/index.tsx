import { createFileRoute } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { CasesProvider } from "@/contexts/CasesContext";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سیناپس مالی | پردازش و تطبیق هوشمند اسناد مالی" },
      {
        name: "description",
        content:
          "لایه هوشمند پردازش، استخراج و تطبیق فاکتور، سفارش خرید و رسید انبار با بررسی انسانی و گزارش نهایی.",
      },
      { property: "og:title", content: "سیناپس مالی | پردازش هوشمند اسناد مالی" },
      {
        property: "og:description",
        content: "استخراج خودکار اطلاعات فاکتور، تطبیق اسناد و تأیید پرونده‌ها در یک جریان کاری ساده.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeRoute,
});

function HomeRoute() {
  return (
    <TooltipProvider>
      <CasesProvider>
        <Index />
        <Sonner />
        <Toaster />
      </CasesProvider>
    </TooltipProvider>
  );
}
