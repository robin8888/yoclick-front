import { View } from 'react-native';

import type { RoutineProgressResponseDtoPeopleItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatNumericDate } from '@/shared/lib/format';
import { Text } from '@/ui/atoms/Text';

import { useRoutineProgress } from '../hooks/useRoutineQueries';
import { createCardStyle, GROW_STYLE, ROW_STYLE, SECTION_STYLE } from './RoutinesCommon.styles';
import { useTheme } from '@/shared/theme';

const ISO_DATE_LENGTH = 10;

function describePersonProgress(person: RoutineProgressResponseDtoPeopleItem): string {
  if (person.lastCompletedAt === null) {
    return i18n.t('routines.progress.teamPersonTimes', { count: 0 });
  }
  return i18n.t('routines.progress.teamPersonTimes', {
    count: person.completionCount,
    date: formatNumericDate(person.lastCompletedAt.slice(0, ISO_DATE_LENGTH)),
  });
}

/** Para el equipo: cuántas veces ha hecho la rutina cada persona que la tiene. */
export function RoutineProgressSection({
  routineId,
}: Readonly<{ routineId: string }>): React.JSX.Element | null {
  const theme = useTheme();
  const progress = useRoutineProgress(routineId);
  const people = progress.data?.people ?? [];
  if (!progress.isSuccess) return null;

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('routines.progress.teamTitle')}
      </Text>
      {people.length === 0 ? (
        <Text color="ink2">{i18n.t('routines.progress.teamEmpty')}</Text>
      ) : (
        <View style={createCardStyle(theme)}>
          {people.map((person) => (
            <View key={person.membershipId} accessible style={ROW_STYLE}>
              <View style={GROW_STYLE}>
                <Text variant="bodyStrong">{person.fullName}</Text>
                <Text variant="caption" color="ink2">
                  {describePersonProgress(person)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
