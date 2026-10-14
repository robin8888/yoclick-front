import { formatLongDate } from '@/features/booking';
import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CenterAgendaHeader } from '../components/CenterAgendaHeader';
import { InstructorQuickActions } from '../components/InstructorQuickActions';
import { useAgendaDay } from '../hooks/useAgendaDay';

function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

/** «Inicio» del profesor: sus accesos como botones grandes, igual que el inicio del centro. */
export function InstructorHomeScreen(): React.JSX.Element {
  const day = useAgendaDay();
  const vocabulary = getSectorVocabulary(useActiveCenterSectorId());
  const title = i18n.t('staffAgenda.instructor.homeTitle');

  return (
    <ScreenTemplate isHeaderHidden title={title}>
      <CenterAgendaHeader
        dateLabel={formatLongDate(`${day.isoDate}T12:00:00.000Z`, 'UTC')}
        title={title}
        notificationsHref="/(staff)/(tabs)/notifications"
      />
      <InstructorQuickActions routineLabel={capitalize(vocabulary.routine.plural)} />
    </ScreenTemplate>
  );
}
