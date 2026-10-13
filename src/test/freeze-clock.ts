/** Fija solo `Date` (los temporizadores siguen reales) para que «ahora» no cambie con los años. */
export function freezeClockAt(isoInstant: string): void {
  jest.useFakeTimers({
    now: new Date(isoInstant),
    doNotFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'setImmediate',
      'clearImmediate',
      'nextTick',
      'queueMicrotask',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'requestIdleCallback',
      'cancelIdleCallback',
      'hrtime',
      'performance',
    ],
  });
}

export function restoreClock(): void {
  jest.useRealTimers();
}
