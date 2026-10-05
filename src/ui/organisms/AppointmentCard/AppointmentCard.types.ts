import type { BadgeTone } from '@/ui/atoms/Badge';

export interface AppointmentCardProps {
  serviceName: string;
  /** «jue 8 oct · 18:00». */
  whenLabel: string;
  /** «Con Álex Moreno». */
  staffLabel: string;
  /** «Confirmada», «Cancelada»: el estado siempre va con palabra. */
  statusLabel: string;
  statusTone: BadgeTone;
  /** Sin acción (citas pasadas) la tarjeta es solo de lectura. */
  actionLabel?: string | undefined;
  onActionPress?: (() => void) | undefined;
}
