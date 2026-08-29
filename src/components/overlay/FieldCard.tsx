import { useRef, useEffect, useState } from 'react';
import { DocumentField } from '@/types/document';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RotateCcw, PenTool, Eye } from 'lucide-react';

interface FieldCardProps {
  field: DocumentField;
  isActive: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
  onAdjustBox: () => void;
  isDrawingMode: boolean;
  compact?: boolean;
}

export const FieldCard = ({
  field,
  isActive,
  onFocus,
  onBlur,
  onChange,
  onAdjustBox,
  isDrawingMode,
  compact = false,
}: FieldCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(field.value);

  useEffect(() => {
    setLocalValue(field.value);
  }, [field.value]);

  useEffect(() => {
    if (isActive && inputRef.current && !isDrawingMode) {
      inputRef.current.focus();
    }
  }, [isActive, isDrawingMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleReset = () => {
    setLocalValue(field.originalValue);
    onChange(field.originalValue);
  };

  const isModified = localValue !== field.originalValue;

  return (
    <div
      data-field-id={field.id}
      className={cn(
        'group relative rounded-lg border transition-all duration-200',
        compact ? 'p-3' : 'p-4',
        isActive
          ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
          : 'border-border bg-card hover:border-muted-foreground/30',
        isDrawingMode && 'border-accent bg-accent/10'
      )}
      onClick={onFocus}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <label className={cn('font-medium text-foreground truncate', compact ? 'text-xs' : 'text-sm')}>
            {field.key}
          </label>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {isModified && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw size={12} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAdjustBox();
            }}
            className={cn(
              'h-6 w-6 p-0 text-muted-foreground hover:text-foreground',
              isDrawingMode && 'text-accent bg-accent/20'
            )}
          >
            <PenTool size={12} />
          </Button>
        </div>
      </div>

      {/* Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={localValue}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={cn(
            'bg-background border-input text-foreground placeholder:text-muted-foreground',
            'focus:border-primary focus:ring-1 focus:ring-primary/20',
            compact ? 'h-8 text-sm' : 'h-9',
            isModified && 'pr-6'
          )}
          placeholder="مقدار را وارد کنید..."
        />
        {isModified && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
          </div>
        )}
      </div>

      {/* Original Value Preview */}
      {isModified && !compact && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye size={10} />
          <span className="line-through truncate">{field.originalValue}</span>
        </div>
      )}

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute -left-px top-3 bottom-3 w-0.5 bg-primary rounded-full" />
      )}
    </div>
  );
};
