import { useRef, useEffect, useState } from 'react';
import { DocumentField } from '@/types/document';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, RotateCcw, PenTool, Eye } from 'lucide-react';

interface FieldInputProps {
  field: DocumentField;
  isActive: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
  onAdjustBox: () => void;
  pendingBoxAdjustment: boolean;
}

export const FieldInput = ({
  field,
  isActive,
  onFocus,
  onBlur,
  onChange,
  onAdjustBox,
  pendingBoxAdjustment,
}: FieldInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(field.value);

  useEffect(() => {
    setLocalValue(field.value);
  }, [field.value]);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

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
  const isLowConfidence = field.confidence < 60;

  return (
    <div
      className={cn(
        'group relative p-4 rounded-lg border-2 transition-all duration-200',
        isActive
          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
          : isLowConfidence
          ? 'border-red-500/30 bg-red-500/5 hover:border-red-500/50'
          : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600',
        pendingBoxAdjustment && 'border-purple-500 bg-purple-500/10'
      )}
      onClick={onFocus}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-200">
            {field.key}
          </label>
          <ConfidenceBadge confidence={field.confidence} showLabel />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isModified && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="h-7 px-2 text-slate-400 hover:text-white"
            >
              <RotateCcw size={14} />
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
              'h-7 px-2 text-slate-400 hover:text-white',
              pendingBoxAdjustment && 'text-purple-400 bg-purple-500/20'
            )}
          >
            <PenTool size={14} />
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
            'bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            isModified && 'pr-8'
          )}
          placeholder="Enter value..."
        />
        {isModified && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Original Value Preview */}
      {isModified && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <Eye size={12} />
          <span className="line-through">{field.originalValue}</span>
        </div>
      )}

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute -left-0.5 top-4 bottom-4 w-1 bg-blue-500 rounded-full" />
      )}
    </div>
  );
};
