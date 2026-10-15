import type { BroadcastTargetsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { OptionCard } from '@/ui/molecules/OptionCard';

import type { BroadcastTarget } from '../hooks/useGroupBroadcast';
import { describeClassMeta } from '../model/broadcast-labels';

type TargetClass = BroadcastTargetsResponseDto['classes'][number];

interface BroadcastTargetOptionsProps {
  targets: BroadcastTargetsResponseDto;
  chosenTarget: BroadcastTarget | null;
  clientWord: string;
  onChoose: (target: BroadcastTarget) => void;
}

/** Las clases fijas (sala y hora) con las personas apuntadas; sin ninguna, no se puede elegir. */
function ClassOptions({
  classes,
  chosenTarget,
  onChoose,
}: Readonly<{
  classes: readonly TargetClass[];
  chosenTarget: BroadcastTarget | null;
  onChoose: (target: BroadcastTarget) => void;
}>): React.JSX.Element | null {
  if (classes.length === 0) return null;
  return (
    <>
      <Text variant="titleMd" role="heading">
        {i18n.t('chat.group.classesSection')}
      </Text>
      {classes.map((entry) => (
        <OptionCard
          key={entry.seriesId}
          title={entry.name}
          meta={describeClassMeta(entry)}
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
  targets,
  chosenTarget,
  clientWord,
  onChoose,
}: Readonly<BroadcastTargetOptionsProps>): React.JSX.Element {
  return (
    <>
      <Text variant="titleMd" role="heading">
        {i18n.t('chat.group.groupsSection')}
      </Text>
      {targets.groups.length === 0 ? (
        <Text color="ink2">{i18n.t('chat.group.noGroups', { clientWord })}</Text>
      ) : null}
      {targets.groups.map((group) => (
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
      <ClassOptions classes={targets.classes} chosenTarget={chosenTarget} onChoose={onChoose} />
    </>
  );
}
