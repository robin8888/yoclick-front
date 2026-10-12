import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { EnrollmentsSection } from '../components/EnrollmentsSection';
import { ScheduleSeriesSummary } from '../components/ScheduleSeriesSummary';
import { useEndScheduleSeries } from '../hooks/useEndScheduleSeries';
import { useScheduleSeriesList } from '../hooks/useScheduleSeriesList';
import { scheduleRouteParamsSchema } from '../model/schedule-route-params';
import {
  describeSeriesDays,
  describeSeriesName,
  type ScheduleSeries,
} from '../model/schedule-summary';

/** Confirmación de «Terminar horario»: se cancelan las sesiones futuras sin citas sueltas. */
function EndSeriesSheet({
  series,
  isVisible,
  onClose,
}: Readonly<{
  series: ScheduleSeries;
  isVisible: boolean;
  onClose: () => void;
}>): React.JSX.Element {
  const router = useRouter();
  const end = useEndScheduleSeries(series.seriesId);

  return (
    <>
      {end.errorMessage === null ? null : <FormErrorBanner message={end.errorMessage} />}
      <ConfirmSheet
        isVisible={isVisible}
        title={i18n.t('centerAdmin.schedules.endTitle')}
        message={i18n.t('centerAdmin.schedules.endMessage')}
        confirmLabel={i18n.t('centerAdmin.schedules.endConfirm')}
        dismissLabel={i18n.t('actions.cancel')}
        isConfirming={end.isEnding}
        isDestructive
        onConfirm={() => {
          end.endSeries(router.back);
        }}
        onDismiss={onClose}
      />
    </>
  );
}

/** «Editar horario» y «Terminar horario» (con su confirmación). */
function SeriesActions({ series }: Readonly<{ series: ScheduleSeries }>): React.JSX.Element {
  const router = useRouter();
  const [isEnding, setIsEnding] = useState(false);

  return (
    <>
      <Button
        isFullWidth
        variant="outline"
        label={i18n.t('centerAdmin.schedules.editAction')}
        onPress={() => {
          router.push({
            pathname: '/(admin)/schedules/edit/[seriesId]',
            params: { seriesId: series.seriesId },
          });
        }}
      />
      <Button
        isFullWidth
        variant="ghostDanger"
        label={i18n.t('centerAdmin.schedules.endAction')}
        onPress={() => {
          setIsEnding(true);
        }}
      />
      <EndSeriesSheet
        series={series}
        isVisible={isEnding}
        onClose={() => {
          setIsEnding(false);
        }}
      />
    </>
  );
}

function ScheduleSeriesContent({
  series,
}: Readonly<{ series: ScheduleSeries }>): React.JSX.Element {
  const router = useRouter();
  const isActive = series.status === 'active';

  return (
    <ScreenTemplate
      title={describeSeriesName(series)}
      subtitle={describeSeriesDays(series)}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={isActive ? <SeriesActions series={series} /> : null}
    >
      <ScheduleSeriesSummary series={series} />
      <EnrollmentsSection
        seriesId={series.seriesId}
        capacity={series.capacity}
        canEnroll={isActive}
      />
    </ScreenTemplate>
  );
}

/** Un horario fijo: resumen, grupo fijo (matricular y dar de baja), editar y terminar. */
export function ScheduleSeriesScreen(): React.JSX.Element {
  const router = useRouter();
  const params = scheduleRouteParamsSchema.safeParse(useLocalSearchParams());
  const seriesList = useScheduleSeriesList();
  const series = seriesList.data?.series.find(
    (candidate) => params.success && candidate.seriesId === params.data.seriesId,
  );

  if (!params.success) return <Redirect href="/(admin)/(tabs)/management" />;
  if (series === undefined) {
    return (
      <ScreenTemplate
        title={i18n.t('centerAdmin.schedules.sectionTitle')}
        onBackPress={router.back}
        backLabel={i18n.t('actions.back')}
      >
        {seriesList.isSuccess ? (
          <Text color="ink2">{i18n.t('centerAdmin.schedules.notFound')}</Text>
        ) : null}
      </ScreenTemplate>
    );
  }
  return <ScheduleSeriesContent series={series} />;
}
