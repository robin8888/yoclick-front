import { useBackAction } from '@/shared/hooks/useBackAction';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { LoadErrorState } from '@/features/join';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { VoiceCallHistory } from '../components/VoiceCallHistory';
import { VoiceConfigForm } from '../components/VoiceConfigForm';
import { VoiceLineCard } from '../components/VoiceLineCard';
import { VoiceLockedNotice } from '../components/VoiceLockedNotice';
import { VoiceStatusCard } from '../components/VoiceStatusCard';
import { VoiceUsageCard } from '../components/VoiceUsageCard';
import { useVoiceOverview } from '../hooks/useVoiceOverview';
import { isVoiceReceptionistAvailable } from '../model/voice-service-state';

/**
 * «Contestador IA» (solo propietario y administración): estado y encendido, número puente y cómo
 * desviar, consumo de minutos, ajustes e historial. Sin el servicio, solo una explicación.
 */
export function VoiceReceptionistScreen(): React.JSX.Element {
  const onBackPress = useBackAction();
  const overview = useVoiceOverview();

  return (
    <ScreenTemplate
      title={i18n.t('voiceReceptionist.title')}
      subtitle={i18n.t('voiceReceptionist.subtitle')}
      onBackPress={onBackPress}
    >
      {overview.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {overview.isError ? (
        <LoadErrorState
          title={i18n.t('voiceReceptionist.loadErrorTitle')}
          error={overview.error}
          onRetry={() => {
            void overview.refetch();
          }}
          isRetrying={overview.isFetching}
        />
      ) : null}
      {overview.isSuccess && !isVoiceReceptionistAvailable(overview.data) ? (
        <VoiceLockedNotice />
      ) : null}
      {overview.isSuccess && isVoiceReceptionistAvailable(overview.data) ? (
        <>
          <VoiceStatusCard overview={overview.data} />
          <VoiceLineCard overview={overview.data} />
          <VoiceUsageCard overview={overview.data} />
          <VoiceConfigForm overview={overview.data} />
          <VoiceCallHistory />
        </>
      ) : null}
    </ScreenTemplate>
  );
}
