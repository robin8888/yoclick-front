// Movimiento de docs/design/sistema-de-diseno.md. No está en tokens.json, por eso se mantiene a mano.
export const motionTokens = {
  durationPressMs: 120,
  durationColorMs: 220,
  durationEnterMs: 380,
  staggerStepMs: 40,
  // Medio ciclo del pulso de atención: ciclo completo ≈ 2,2 s, muy por debajo de los 3 destellos/s de WCAG 2.3.1.
  durationPulseMs: 1100,
  pulseMinOpacity: 0.2,
  // Tintineo de la campana: giro que se amortigua, un pequeño salto y dos ondas; luego una pausa larga.
  durationRingStepMs: 110,
  ringPauseMs: 2600,
  ringMaxDegrees: 20,
  ringPivotOffset: 8,
  ringPopScale: 1.14,
  durationRippleMs: 1100,
  rippleStaggerMs: 280,
  rippleEndScale: 1.9,
  rippleMaxOpacity: 0.5,
  // Con «reducir movimiento» las animaciones pasan a 1 ms (no a 0, para que los callbacks se disparen).
  reducedMotionDurationMs: 1,
  pressScaleButton: 0.97,
  pressScaleIconButton: 0.92,
  easeOut: [0.16, 1, 0.3, 1],
  easeSpring: [0.34, 1.56, 0.64, 1],
} as const;

export type MotionTokens = typeof motionTokens;
