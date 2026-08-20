import { useTranslation } from 'react-i18next';
import type { CapacityUsage } from '../state/types';

export function CapacityWarning({ resource, capacity }: { resource: 'boards' | 'lists' | 'cards'; capacity?: CapacityUsage | null }) {
  const { t } = useTranslation();
  if (!capacity || capacity.limit <= 0 || capacity.used / capacity.limit < 0.75) return null;
  return <p className="capacity-warning" role="status">{t(`capacity.${resource}`, { used: capacity.used, limit: capacity.limit })}</p>;
}
