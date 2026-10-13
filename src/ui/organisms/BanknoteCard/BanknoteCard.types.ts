import type { ReactNode } from 'react';

/** `active`: con la marca del centro; `pending`: ámbar, a la espera; `inactive`: apagado (agotado, caducado). */
export type BanknoteTone = 'active' | 'pending' | 'inactive';

/** El centro cuyo logo va de marca de agua; sin logo, salen sus iniciales. */
export interface BanknoteWatermark {
  centerName: string;
  logoUrl: string | null;
}

export interface BanknoteCardProps {
  /** Nombre del bono, arriba y centrado como el título de un billete. */
  title: string;
  /** La cifra grande («6» clases que quedan, «10» clases que trae). */
  valueText: string;
  /** Lo que acompaña a la cifra («clases»). */
  unitText: string;
  /** Líneas pequeñas: caducidad, servicios en los que vale, quién lo pidió. */
  detailLines: readonly string[];
  /** Número de serie decorativo («Nº 4F2A91»). */
  serialText: string;
  /** El sello de arriba a la derecha: el estado con palabra («Activo») o el precio. */
  stampText: string;
  tone?: BanknoteTone;
  /** Lo que lee el lector de pantalla de todo el billete: el dibujo es decorativo. */
  accessibilityLabel: string;
  /** Marca de agua con el logo del centro, tenue y detrás del texto. */
  watermark?: BanknoteWatermark | undefined;
  /** Si se pasa, el billete entero es un botón. */
  onPress?: (() => void) | undefined;
  /** Acciones bajo el billete (pedir, activar, quitar): salen dentro de la tarjeta, en una franja. */
  children?: ReactNode;
}
