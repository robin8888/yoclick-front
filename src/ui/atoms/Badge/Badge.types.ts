export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  /** Siempre con palabra («Confirmada», «Cancelada»): el estado nunca se comunica solo con color. */
  label: string;
  tone?: BadgeTone;
}
