import { useState } from 'react';

interface Visibility {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
}

/** Mostrar y ocultar algo (una hoja de confirmación) sin repetir el estado y sus dos manejadores. */
export function useVisibility(): Visibility {
  const [isVisible, setIsVisible] = useState(false);

  return {
    isVisible,
    show: () => {
      setIsVisible(true);
    },
    hide: () => {
      setIsVisible(false);
    },
  };
}
