import { ScrollView } from 'react-native';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import {
  useBroadcastGroups,
  useBroadcastSeries,
  type BroadcastResult,
  type BroadcastTarget,
  type useGroupBroadcast,
} from '../hooks/useGroupBroadcast';
import { createGroupListContentStyle, FILL_STYLE } from '../screens/ConversationScreen.styles';
import { BroadcastTargetOptions } from './BroadcastTargetOptions';

function BroadcastSummary({ result }: Readonly<{ result: BroadcastResult }>): React.JSX.Element {
  return (
    <>
      <Text variant="bodyStrong">{i18n.t('chat.group.sent', { count: result.sentCount })}</Text>
      {result.skippedMinorCount === 0 ? null : (
        <Text variant="caption" color="ink2">
          {i18n.t('chat.group.skippedMinors', { count: result.skippedMinorCount })}
        </Text>
      )}
    </>
  );
}

/** Grupos de clientes y clases fijas: cargando, con error y reintento, o para elegir uno. */
function TargetChoice({
  chosenTarget,
  clientWord,
  onChoose,
}: Readonly<{
  chosenTarget: BroadcastTarget | null;
  clientWord: string;
  onChoose: (target: BroadcastTarget) => void;
}>): React.JSX.Element {
  const groups = useBroadcastGroups();
  const series = useBroadcastSeries();

  if (groups.isPending || series.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (groups.isError || series.isError) {
    return (
      <LoadErrorState
        title={i18n.t('chat.errorTitle')}
        error={groups.error ?? series.error}
        onRetry={() => {
          void groups.refetch();
          void series.refetch();
        }}
      />
    );
  }
  return (
    <BroadcastTargetOptions
      groups={groups.data.groups}
      series={series.data.series}
      chosenTarget={chosenTarget}
      clientWord={clientWord}
      onChoose={onChoose}
    />
  );
}

interface BroadcastBodyProps {
  broadcast: ReturnType<typeof useGroupBroadcast>;
  clientWord: string;
  /** El nombre de la clase con la que se llega desde «Gestión», si es el caso. */
  className: string | undefined;
  chosenTarget: BroadcastTarget | null;
  isChoiceHidden: boolean;
  onChoose: (target: BroadcastTarget) => void;
}

/** Lo que se desplaza: la explicación, a quién se escribe y el resultado del envío. */
export function BroadcastBody({
  broadcast,
  clientWord,
  className,
  chosenTarget,
  isChoiceHidden,
  onChoose,
}: Readonly<BroadcastBodyProps>): React.JSX.Element {
  const theme = useTheme();
  const explanation =
    className === undefined
      ? i18n.t('chat.group.subtitle', { clientWord })
      : i18n.t('chat.group.classSubtitle', { name: className });

  return (
    <ScrollView
      style={FILL_STYLE}
      contentContainerStyle={createGroupListContentStyle(theme)}
      keyboardShouldPersistTaps="handled"
    >
      <Text color="ink2">{explanation}</Text>
      {isChoiceHidden ? null : (
        <TargetChoice chosenTarget={chosenTarget} clientWord={clientWord} onChoose={onChoose} />
      )}
      {broadcast.errorMessage === null ? null : (
        <FormErrorBanner message={broadcast.errorMessage} />
      )}
      {broadcast.result === null ? null : <BroadcastSummary result={broadcast.result} />}
    </ScrollView>
  );
}
