import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ============================================================
// Icon helper — resolves icon names from constants to components
// ============================================================

export function getIcon(name: string): LucideIcon {
  const iconMap = Icons as unknown as Record<string, LucideIcon>;
  const icon = iconMap[name];
  return icon || Icons.Circle;
}
