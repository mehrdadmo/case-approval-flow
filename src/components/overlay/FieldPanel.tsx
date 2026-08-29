import { useRef, useEffect } from 'react';
import { DocumentField } from '@/types/document';
import { FieldCard } from './FieldCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconExtract } from '@/components/icons/SynapseIcons';
import { cn } from '@/lib/utils';

interface FieldPanelProps {
  fields: DocumentField[];
  activeFieldId: string | null;
  onFieldFocus: (fieldId: string) => void;
  onFieldBlur: () => void;
  onValueChange: (fieldId: string, value: string) => void;
  onAdjustBox: (fieldId: string) => void;
  isDrawingMode: boolean;
  compactMode?: boolean;
}

export const FieldPanel = ({
  fields,
  activeFieldId,
  onFieldFocus,
  onFieldBlur,
  onValueChange,
  onAdjustBox,
  isDrawingMode,
  compactMode = false,
}: FieldPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group fields by category
  const groupedFields = fields.reduce((acc, field) => {
    const category = (field as any).category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(field);
    return acc;
  }, {} as Record<string, DocumentField[]>);

  // Scroll to active field
  useEffect(() => {
    if (activeFieldId && scrollRef.current) {
      const activeElement = scrollRef.current.querySelector(`[data-field-id="${activeFieldId}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeFieldId]);

  return (
    <div dir="rtl" className={cn('flex flex-col h-full', compactMode ? 'bg-background' : 'bg-card/50')}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <IconExtract className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">فیلدهای استخراج‌شده</h3>
            <p className="text-xs text-muted-foreground">{fields.length} فیلد شناسایی شد</p>
          </div>
        </div>
      </div>

      {/* Fields List */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className={cn('p-4 space-y-6', compactMode && 'grid grid-cols-2 gap-4 space-y-0')}>
          {Object.entries(groupedFields).map(([category, categoryFields]) => (
            <div key={category} className={compactMode ? 'col-span-2' : ''}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                {category}
              </h4>
              <div className={cn('space-y-2', compactMode && 'grid grid-cols-2 gap-3 space-y-0')}>
                {categoryFields.map((field) => (
                    <FieldCard
                      key={field.id}
                      field={field}
                      isActive={activeFieldId === field.id}
                      onFocus={() => onFieldFocus(field.id)}
                      onBlur={onFieldBlur}
                      onChange={(value) => onValueChange(field.id, value)}
                      onAdjustBox={() => onAdjustBox(field.id)}
                      isDrawingMode={isDrawingMode && activeFieldId === field.id}
                      compact={compactMode}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Help Footer */}
      <div className="px-5 py-3 border-t border-border bg-muted/30 shrink-0">
        <p className="text-xs text-muted-foreground text-center">
          روی هر فیلد کلیک کنید تا در سند مشخص شود • برای تنظیم محل، از آیکون قلم استفاده کنید
        </p>
      </div>
    </div>
  );
};
