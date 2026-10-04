// Movimiento de docs/design/sistema-de-diseno.md. No está en tokens.json, por eso se mantiene a mano.
export const motionTokens = {
  durationPressMs: 120,
  durationColorMs: 220,
  durationEnterMs: 380,
  staggerStepMs: 40,
  // Con «reducir movimiento» las animaciones pasan a 1 ms (no a 0, para que los callbacks se disparen).
  reducedMotionDurationMs: 1,
  pressScaleButton: 0.97,
  pressScaleIconButton: 0.92,
  easeOut: [0.16, 1, 0.3, 1],
  easeSpring: [0.34, 1.56, 0.64, 1],
} as const;

export type MotionTokens = typeof motionTokens;
