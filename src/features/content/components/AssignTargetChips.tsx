import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Chip } from '@/ui/atoms/Chip';
import { Text } from '@/ui/atoms/Text';

import { useGroupOptions } from '../hooks/useGroupOptions';
import type { AssignmentDraft } from '../model/assignment-draft';
import { describeContentLevel, CONTENT_LEVELS, type ContentLevel } from '../model/content-levels';
import { STACK_STYLE, WRAP_ROW_STYLE } from './Content.styles';

interface LevelChipsProps {
  draft: AssignmentDraft;
  levelWords: readonly string[];
  onLevelToggle: (level: ContentLevel) => void;
}

/** «Por nivel»: varios niveles a la vez. */
export function LevelChips({
  draft,
  levelWords,
  onLevelToggle,
}: Readonly<LevelChipsProps>): React.JSX.Element {
  return (
    <View style={STACK_STYLE}>
      <Text variant="bodyStrong">{i18n.t('content.assign.byLevel')}</Text>
      <View style={WRAP_ROW_STYLE}>
        {CONTENT_LEVELS.map((level) => (
          <Chip
            key={level}
            selectionRole="checkbox"
            label={describeContentLevel(level, levelWords)}
            isSelected={draft.levels.includes(level)}
            onPress={() => {
              onLevelToggle(level);
            }}
          />
        ))}
      </View>
    </View>
  );
}

interface GroupChipsProps {
  draft: AssignmentDraft;
  onGroupToggle: (groupId: string) => void;
}

/** «Por grupo»: los grupos del centro, varios a la vez. */
export function GroupChips({ draft, onGroupToggle }: Readonly<GroupChipsProps>): React.JSX.Element {
  const groups = useGroupOptions().data?.groups ?? [];

  return (
    <View style={STACK_STYLE}>
      <Text variant="bodyStrong">{i18n.t('content.assign.byGroup')}</Text>
      {groups.length === 0 ? (
        <Text color="ink2">{i18n.t('content.assign.noGroups')}</Text>
      ) : (
        <View style={WRAP_ROW_STYLE}>
          {groups.map((group) => (
            <Chip
              key={group.id}
              selectionRole="checkbox"
              label={group.name}
              isSelected={draft.groupIds.includes(group.id)}
              onPress={() => {
                onGroupToggle(group.id);
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
