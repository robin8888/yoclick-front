import type { BadgeTone } from '@/ui/atoms/Badge';
import type { IconName } from '@/ui/atoms/Icon';

export interface AppointmentDateTile {
  /** «JUE». */
  weekdayLabel: string;
  /** «1». */
  dayLabel: string;
  /** «OCT». */
  monthLabel: string;
  /** Lo que lee el lector de pantalla: «jue 1 oct». */
  accessibleLabel: string;
}

export interface AppointmentButtonAction {
  label: string;
  /** Si varias tarjetas repiten el mismo texto visible: «Cancelar cita de Yoga». */
  accessibilityLabel?: string | undefined;
  onPress: () => void;
  variant: 'secondary' | 'outline';
  iconName?: IconName | undefined;
}

export interface AppointmentLinkAction {
  label: string;
  iconName: IconName;
  onPress: () => void;
  isDisabled?: boolean | undefined;
}

export interface AppointmentCardProps {
  dateTile: AppointmentDateTile;
  serviceName: string;
  /** «18:00 · 60 min · Lucía Ferrer». */
  detailsLabel: string;
  /** «Confirmada», «Cancelada»: el estado siempre va con palabra. */
  statusLabel: string;
  statusTone: BadgeTone;
  /** Fila de botones bajo la cita (reprogramar, cancelar). Sin ellos la tarjeta es de lectura. */
  buttonActions?: readonly AppointmentButtonAction[] | undefined;
  /** Fila de enlaces con icono bajo los botones (QR de acceso, al calendario). */
  linkActions?: readonly AppointmentLinkAction[] | undefined;
}
