import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

// Confidence badges are hidden per product requirement.
export const ConfidenceBadge = (_: ConfidenceBadgeProps) => null;
