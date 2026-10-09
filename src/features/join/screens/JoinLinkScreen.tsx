import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { z } from 'zod';

import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { LoadingScreenTemplate } from '@/ui/templates/LoadingScreenTemplate';

import { LoadErrorScreen } from '../components/LoadErrorScreen';
import { useFindCenterByJoinCode } from '../hooks/useFindCenterByJoinCode';
import { isJoinCodeWellFormed, MAX_JOIN_CODE_INPUT_LENGTH } from '../model/join-code';

const joinLinkParamsSchema = z.object({
  code: z
    .string()
    .trim()
    .max(MAX_JOIN_CODE_INPUT_LENGTH)
    .refine((code) => isJoinCodeWellFormed(code)),
});

function JoinLinkLookup({ code }: Readonly<{ code: string }>): React.JSX.Element {
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const findCenter = useFindCenterByJoinCode('link');
  const { mutate } = findCenter;
  const hasStarted = useRef(false);

  // Buscar el centro es hablar con el servidor, un sistema externo: se hace una sola vez al abrir.
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    mutate(code);
  }, [code, mutate]);

  if (findCenter.isError) {
    return (
      <LoadErrorScreen
        screenTitle={i18n.t('join.start.title')}
        title={i18n.t('join.link.errorTitle')}
        error={findCenter.error}
        onRetry={() => {
          findCenter.mutate(code);
        }}
        isRetrying={findCenter.isPending}
      />
    );
  }
  if (findCenter.isSuccess) {
    // Con sesión se confirma el centro; sin ella, el inicio ya viene con su marca (ya está elegido).
    return <Redirect href={isSignedIn ? `/join/${findCenter.data.id}` : '/(auth)/start'} />;
  }
  return <LoadingScreenTemplate loadingLabel={getSharedStateCopy().loadingLabel} />;
}

/**
 * `https://yoclick.app/j/{código}` y `yoclick://j/{código}`: el enlace del QR del centro o el que
 * llega por WhatsApp. Elige el centro y deja que el registro y el inicio de sesión se vistan con
 * su marca; con sesión abierta pide confirmar. El parámetro se valida con zod (SEC-M4).
 */
export function JoinLinkScreen(): React.JSX.Element {
  const params = joinLinkParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/" />;
  return <JoinLinkLookup code={params.data.code} />;
}
