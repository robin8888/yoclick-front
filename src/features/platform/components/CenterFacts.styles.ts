import type { ViewStyle } from 'react-native';

const FACT_GAP = 12;
const LABEL_MAX_WIDTH = '48%';

export const FACTS_STYLE: ViewStyle = { gap: FACT_GAP, alignItems: 'flex-start' };

/** Etiqueta a la izquierda y valor a la derecha; un valor largo se parte en líneas sin salirse. */
export const FACT_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: FACT_GAP,
};

export const FACT_LABEL_STYLE: ViewStyle = { flexShrink: 1, maxWidth: LABEL_MAX_WIDTH };

export const FACT_VALUE_STYLE: ViewStyle = { flex: 1, minWidth: 0, alignItems: 'flex-end' };
