import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import type { EnrollResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Chip } from '@/ui/atoms/Chip';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { EligibleEnrollPicker } from '../components/EligibleEnrollPicker';
import { EnrollResultSheet } from '../components/EnrollResultSheet';
import { useEnrollClients } from '../hooks/useEnrollClients';
import { useScheduleSeriesList } from '../hooks/useScheduleSeriesList';
import { scheduleRouteParamsSchema } from '../model/schedule-route-params';
import { describeSeriesName } from '../model/schedule-summary';

interface ChosenClient {
  membershipId: string;
  fullName: string;
}

const CHIPS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

function toggleChosen(chosen: readonly ChosenClient[], client: ChosenClient): ChosenClient[] {
  const isChosen = chosen.some(({ membershipId }) => membershipId === client.membershipId);
  return isChosen
    ? chosen.filter(({ membershipId }) => membershipId !== client.membershipId)
    : [...chosen, client];
}

interface ChosenClientsFieldProps {
  chosen: readonly ChosenClient[];
  serviceId: string;
  onToggle: (client: ChosenClient) => void;
}

/** Quienes ya están elegidos (con su quitar) y el buscador para añadir a más personas. */
function ChosenClientsField({
  chosen,
  serviceId,
  onToggle,
}: Readonly<ChosenClientsFieldProps>): React.JSX.Element {
  return (
    <>
      {chosen.length === 0 ? null : (
        <View style={CHIPS_STYLE}>
          {chosen.map((client) => (
            <Chip
              key={client.membershipId}
              selectionRole="checkbox"
              label={client.fullName}
              accessibilityLabel={i18n.t('centerAdmin.schedules.removeClientLabel', {
                name: client.fullName,
              })}
              isSelected
              onPress={() => {
                onToggle(client);
              }}
            />
          ))}
        </View>
      )}
      <EligibleEnrollPicker
        serviceId={serviceId}
        selectedMembershipIds={chosen.map(({ membershipId }) => membershipId)}
        onClientToggle={onToggle}
      />
    </>
  );
}

interface EnrollSubmitButtonProps {
  seriesId: string;
  chosen: readonly ChosenClient[];
  onResult: (result: EnrollResponseDto) => void;
}

/** «Matricular (N)»: envía a las personas elegidas y entrega el resultado del servidor. */
function EnrollSubmitButton({
  seriesId,
  chosen,
  onResult,
}: Readonly<EnrollSubmitButtonProps>): React.JSX.Element {
  const enroll = useEnrollClients(seriesId);

  return (
    <>
      {enroll.errorMessage === null ? null : <FormErrorBanner message={enroll.errorMessage} />}
      <Button
        isFullWidth
        label={i18n.t('centerAdmin.schedules.enrollSubmit', { count: chosen.length })}
        isDisabled={chosen.length === 0}
        isLoading={enroll.isEnrolling}
        onPress={() => {
          enroll.enrollClients(
            chosen.map(({ membershipId }) => membershipId),
            onResult,
          );
        }}
      />
    </>
  );
}

function EnrollClientsContent({
  seriesId,
  seriesName,
  serviceId,
}: Readonly<{
  seriesId: string;
  seriesName: string;
  serviceId: string;
}>): React.JSX.Element {
  const router = useRouter();
  const [chosen, setChosen] = useState<ChosenClient[]>([]);
  const [result, setResult] = useState<EnrollResponseDto | null>(null);

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.schedules.enrollTitle')}
      subtitle={i18n.t('centerAdmin.schedules.enrollSubtitle', { name: seriesName })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={<EnrollSubmitButton seriesId={seriesId} chosen={chosen} onResult={setResult} />}
    >
      <ChosenClientsField
        chosen={chosen}
        serviceId={serviceId}
        onToggle={(client) => {
          setChosen((current) => toggleChosen(current, client));
        }}
      />
      <EnrollResultSheet
        result={result}
        namesByMembershipId={Object.fromEntries(
          chosen.map((client) => [client.membershipId, client.fullName]),
        )}
        onDone={router.back}
      />
    </ScreenTemplate>
  );
}

/** «Matricular»: elige a las personas del grupo fijo y el servidor les crea sus citas futuras. */
export function EnrollClientsScreen(): React.JSX.Element {
  const params = scheduleRouteParamsSchema.safeParse(useLocalSearchParams());
  const seriesList = useScheduleSeriesList();
  const series = seriesList.data?.series.find(
    (candidate) => params.success && candidate.seriesId === params.data.seriesId,
  );

  if (!params.success) return <Redirect href="/(admin)/(tabs)/management" />;
  return (
    <EnrollClientsContent
      seriesId={params.data.seriesId}
      seriesName={series === undefined ? '' : describeSeriesName(series)}
      serviceId={series?.service.id ?? ''}
    />
  );
}
