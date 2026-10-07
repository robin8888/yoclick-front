import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { RoutineListResponseDtoRoutinesItem } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { createCardStyle, SECTION_STYLE } from '../components/RoutinesCommon.styles';
import { useRoutineList } from '../hooks/useRoutineQueries';
import {
  buildNewRoutineRoute,
  buildRoutineDetailRoute,
  type RoutineRouteBase,
} from '../model/routine-routes';

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

interface RoutineCardProps {
  routine: RoutineListResponseDtoRoutinesItem;
  onPress: () => void;
}

function RoutineCard({ routine, onPress }: Readonly<RoutineCardProps>): React.JSX.Element {
  const theme = useTheme();
  const summary = i18n.t('routines.summary', {
    exercises: i18n.t('routines.exerciseCount', { count: routine.itemCount }),
    assignments: i18n.t('routines.assignmentCount', { count: routine.assignmentCount }),
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${routine.name}. ${summary}`}
      onPress={onPress}
      style={createCardStyle(theme)}
    >
      <Text variant="bodyStrong">{routine.name}</Text>
      <Text variant="caption" color="ink2">
        {summary}
      </Text>
    </Pressable>
  );
}

function RoutineCards({
  routines,
  routeBase,
}: Readonly<{
  routines: readonly RoutineListResponseDtoRoutinesItem[];
  routeBase: RoutineRouteBase;
}>): React.JSX.Element {
  const router = useRouter();

  return (
    <View style={SECTION_STYLE}>
      {routines.map((routine) => (
        <RoutineCard
          key={routine.id}
          routine={routine}
          onPress={() => {
            router.push(buildRoutineDetailRoute(routeBase, routine.id));
          }}
        />
      ))}
    </View>
  );
}

interface RoutineListContentProps {
  routeBase: RoutineRouteBase;
  words: { routineWord: string; routineWordPlural: string };
}

/** La lista con sus estados: cargando, error con reintento, vacía con su acción, o las tarjetas. */
function RoutineListContent({
  routeBase,
  words,
}: Readonly<RoutineListContentProps>): React.JSX.Element {
  const router = useRouter();
  const routines = useRoutineList();
  const list = routines.data?.routines ?? [];
  const openNewRoutine = (): void => {
    router.push(buildNewRoutineRoute(routeBase));
  };

  if (routines.isPending)
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (routines.isError) {
    return (
      <LoadErrorState
        title={i18n.t('routines.listErrorTitle')}
        error={routines.error}
        onRetry={() => void routines.refetch()}
        isRetrying={routines.isFetching}
      />
    );
  }
  if (list.length === 0) {
    return (
      <EmptyState
        iconName="file"
        title={i18n.t('routines.emptyTitle', words)}
        description={i18n.t('routines.emptyDescription')}
        actionLabel={i18n.t('routines.createAction', words)}
        onActionPress={openNewRoutine}
      />
    );
  }
  return <RoutineCards routines={list} routeBase={routeBase} />;
}

/** Prototipo `aroutines`: las rutinas, prácticas, secuencias o tareas del centro, con su botón de crear. */
export function RoutinesScreen({
  routeBase,
}: Readonly<{ routeBase: RoutineRouteBase }>): React.JSX.Element {
  const router = useRouter();
  const { routine: routineWord } = getSectorVocabulary(useActiveCenterSectorId());
  const words = { routineWord: routineWord.singular, routineWordPlural: routineWord.plural };

  return (
    <ScreenTemplate
      title={capitalize(routineWord.plural)}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <Button
        leadingIconName="plus"
        isFullWidth
        label={i18n.t('routines.createAction', words)}
        onPress={() => {
          router.push(buildNewRoutineRoute(routeBase));
        }}
      />
      <RoutineListContent routeBase={routeBase} words={words} />
    </ScreenTemplate>
  );
}
