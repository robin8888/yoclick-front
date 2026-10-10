import { createContext, useContext, type ReactNode } from 'react';

import { DEFAULT_CENTER_APPEARANCE, type CenterAppearance } from './center-appearance';

const CenterAppearanceContext = createContext<CenterAppearance>(DEFAULT_CENTER_APPEARANCE);

interface CenterAppearanceProviderProps {
  centerAppearance: CenterAppearance;
  children: ReactNode;
}

export function CenterAppearanceProvider({
  centerAppearance,
  children,
}: Readonly<CenterAppearanceProviderProps>): React.JSX.Element {
  return (
    <CenterAppearanceContext.Provider value={centerAppearance}>
      {children}
    </CenterAppearanceContext.Provider>
  );
}

/** Fondo y colmena Premium del centro activo; sin personalizar, todo `null`. */
export function useCenterAppearance(): CenterAppearance {
  return useContext(CenterAppearanceContext);
}
