import type {
  GroupListResponseDtoGroupsItem,
  ScheduleSeriesListResponseDtoSeriesItem,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { OptionCard } from '@/ui/molecules/OptionCard';

import type { BroadcastTarget } from '../hooks/useGroupBroadcast';

interface BroadcastTargetOptionsProps {
  groups: readonly GroupListResponseDtoGroupsItem[];
  series: readonly ScheduleSeriesListResponseDtoSeriesItem[];
  chosenTarget: BroadcastTarget | null;
  clientWord: string;
  onChoose: (target: BroadcastTarget) => void;
}

function describeSeriesMeta(series: ScheduleSeriesListResponseDtoSeriesItem): string {
  const count = i18n.t('chat.group.enrolledCount', { count: series.enrolledCount });
  return series.room === null ? count : `${series.room.name} · ${count}`;
}

/** Las clases fijas (sala y hora) con las personas apuntadas; sin ninguna, no se puede elegir. */
function ClassOptions({
  series,
  chosenTarget,
  onChoose,
}: Readonly<{
  series: readonly ScheduleSeriesListResponseDtoSeriesItem[];
  chosenTarget: BroadcastTarget | null;
  onChoose: (target: BroadcastTarget) => void;
}>): React.JSX.Element | null {
  if (series.length === 0) return null;
  return (
    <>
      <Text variant="titleMd" role="heading">
        {i18n.t('chat.group.classesSection')}
      </Text>
      {series.map((entry) => (
        <OptionCard
          key={entry.seriesId}
          title={entry.label ?? entry.service.name}
          meta={describeSeriesMeta(entry)}
          isSelected={chosenTarget?.kind === 'series' && chosenTarget.seriesId === entry.seriesId}
          isDisabled={entry.enrolledCount === 0}
          onPress={() => {
            onChoose({ kind: 'series', seriesId: entry.seriesId });
          }}
        />
      ))}
    </>
  );
}

/** Los grupos de clientes y, aparte, las clases fijas (en una sala, a una hora) con su gente. */
export function BroadcastTargetOptions({
  groups,
  series,
  chosenTarget,
  clientWord,
  onChoose,
}: Readonly<BroadcastTargetOptionsProps>): React.JSX.Element {
  const activeSeries = series.filter(({ status }) => status === 'active');

  return (
    <>
      <Text variant="titleMd" role="heading">
        {i18n.t('chat.group.groupsSection')}
      </Text>
      {groups.length === 0 ? (
        <Text color="ink2">{i18n.t('chat.group.noGroups', { clientWord })}</Text>
      ) : null}
      {groups.map((group) => (
        <OptionCard
          key={group.id}
          title={group.name}
          meta={i18n.t('chat.group.memberCount', { count: group.memberCount, clientWord })}
          isSelected={chosenTarget?.kind === 'group' && chosenTarget.groupId === group.id}
          isDisabled={group.memberCount === 0}
          onPress={() => {
            onChoose({ kind: 'group', groupId: group.id });
          }}
        />
      ))}
      <ClassOptions series={activeSeries} chosenTarget={chosenTarget} onChoose={onChoose} />
    </>
  );
}
