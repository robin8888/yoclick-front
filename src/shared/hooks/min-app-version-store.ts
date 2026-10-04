import { create } from 'zustand';

import { MIN_APP_VERSION_HEADER } from '@/shared/api/http-transport';

interface MinAppVersionState {
  /** Última versión mínima anunciada por la API; `null` mientras no haya enviado la cabecera. */
  readonly minimumAppVersion: string | null;
  readonly reportResponseHeaders: (headers: Headers) => void;
}

export const useMinAppVersionStore = create<MinAppVersionState>((set) => ({
  minimumAppVersion: null,
  reportResponseHeaders: (headers) => {
    const announcedVersion = headers.get(MIN_APP_VERSION_HEADER);
    if (announcedVersion !== null) set({ minimumAppVersion: announcedVersion });
  },
}));
