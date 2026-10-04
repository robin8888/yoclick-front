// Fondo de las pantallas con marca Yoclick (antes de unirse a un centro). Sale del prototipo
// (`.yc-join-hero`): blanco en claro y degradado azul noche apagado en oscuro. Solo es la
// marca de plataforma: dentro de un centro se usa el fondo neutro del tema.
export const platformHeroDarkGradient = {
  stops: [
    { offset: 0, color: '#111A2B' },
    { offset: 0.55, color: '#10243A' },
    { offset: 1, color: '#0F2B33' },
  ],
  glowColor: '#02BCFD',
  glowOpacity: 0.12,
  glowCenterX: 0.5,
  glowCenterY: 0.14,
  glowRadius: 0.42,
} as const;
