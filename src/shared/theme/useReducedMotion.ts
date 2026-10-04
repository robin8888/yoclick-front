import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Preferencia «reducir movimiento» del sistema. Vive en shared/theme (y no en shared/hooks) porque
 * los átomos solo pueden depender del tema. Sincroniza con un sistema externo, por eso usa efecto.
 */
export function useReducedMotion(): boolean {
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
      if (isSubscribed) setIsReducedMotionEnabled(isEnabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (isEnabled) => {
      setIsReducedMotionEnabled(isEnabled);
    });
    return () => {
      isSubscribed = false;
      subscription.remove();
    };
  }, []);

  return isReducedMotionEnabled;
}
