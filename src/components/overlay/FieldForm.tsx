import { DocumentField, FieldUpdate, BoundingBox } from '@/types/document';
import { FieldInput } from './FieldInput';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldFormProps {
  fields: DocumentField[];
  activeFieldId: string | null;
  onFieldFocus: (fieldId: string) => void;
  onFieldBlur: () => void;
  onFieldChange: (fieldId: string, value: string) => void;
  onAdjustBox: (fieldId: string) => void;
  pendingBoxFieldId: string | null;
  pendingUpdates: Map<string, FieldUpdate>;
  onSave: () => void;
  isSaving?: boolean;
}

export const FieldForm = ({
  fields,
  activeFieldId,
  onFieldFocus,
  onFieldBlur,
  onFieldChange,
  onAdjustBox,
  pendingBoxFieldId,
  pendingUpdates,
  onSave,
  isSaving = false,
}: FieldFormProps) => {
  const lowConfidenceCount = fields.filter((f) => f.confidence < 60).length;
  const mediumConfidenceCount = fields.filter(
    (f) => f.confidence >= 60 && f.confidence < 80
  ).length;
  const highConfidenceCount = fields.filter((f) => f.confidence >= 80).length;
  const modifiedCount = pendingUpdates.size;

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Extracted Fields
              </h2>
              <p className="text-sm text-slate-400">
                {fields.length} fields detected
              </p>
            </div>
          </div>
          <Button
            onClick={onSave}
            disabled={isSaving || modifiedCount === 0}
            className={cn(
              'gap-2 bg-gradient-to-r from-blue-600 to-blue-500',
              'hover:from-blue-500 hover:to-blue-400',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Save size={18} />
            Save Changes
            {modifiedCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                {modifiedCount}
              </span>
            )}
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">
              <span className="font-semibold text-emerald-400">
                {highConfidenceCount}
              </span>{' '}
              High
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">
              <span className="font-semibold text-amber-400">
                {mediumConfidenceCount}
              </span>{' '}
              Medium
            </span>
          </div>
          {lowConfidenceCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-slate-300">
                <span className="font-semibold text-red-400">
                  {lowConfidenceCount}
                </span>{' '}
                Needs Review
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Fields List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {/* Low confidence fields first */}
          {fields
            .sort((a, b) => a.confidence - b.confidence)
            .map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                isActive={activeFieldId === field.id}
                onFocus={() => onFieldFocus(field.id)}
                onBlur={onFieldBlur}
                onChange={(value) => onFieldChange(field.id, value)}
                onAdjustBox={() => onAdjustBox(field.id)}
                pendingBoxAdjustment={pendingBoxFieldId === field.id}
              />
            ))}
        </div>
      </ScrollArea>

      {/* Footer Help */}
      <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 text-center">
          Click a field to highlight it on the document • Use the pen tool to
          adjust bounding boxes
        </p>
      </div>
    </div>
  );
};
