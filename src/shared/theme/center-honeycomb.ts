// Colmena de las pantallas de un centro: mismo dibujo que la de plataforma, pero con el color que
// eligió el propietario y aún más tenue para no competir con el contenido.
export const centerHoneycomb = {
  lineOpacity: 0.14,
  /** Con un color de colmena elegido se sube la opacidad: es lo que la persona quería ver. */
  customLineOpacity: 0.32,
  lineWidth: 1.1,
  /** Distancia del centro de cada celda a sus vértices, en puntos. */
  cellRadius: 28,
} as const;
