import { createContext, useContext, type ReactNode } from 'react';

export interface CenterIdentity {
  name: string;
  /** URL ya completa del logo; `null` si el centro aún no ha subido uno. */
  logoImageUrl: string | null;
  /** Quién ha entrado; `null` mientras no se conoce el nombre. */
  personName: string | null;
  /** «Propietario», «Instructor», «Alumno»… tal como se llama en el centro. */
  roleLabel: string | null;
}

const CenterIdentityContext = createContext<CenterIdentity | null>(null);

interface CenterIdentityProviderProps {
  /** Sin centro activo (antes de unirse) las pantallas no muestran identidad de centro. */
  centerIdentity: CenterIdentity | null;
  children: ReactNode;
}

export function CenterIdentityProvider({
  centerIdentity,
  children,
}: Readonly<CenterIdentityProviderProps>): React.JSX.Element {
  return (
    <CenterIdentityContext.Provider value={centerIdentity}>
      {children}
    </CenterIdentityContext.Provider>
  );
}

/** Nombre y logo del centro en el que está la persona, o `null` fuera de un centro. */
export function useCenterIdentity(): CenterIdentity | null {
  return useContext(CenterIdentityContext);
}
