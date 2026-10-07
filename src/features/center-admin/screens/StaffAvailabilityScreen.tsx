import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState, useMyCenters } from '@/features/join';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { REPORT_SECTION_STYLE } from '../components/ReportCard.styles';
import { StaffAbsencesSection } from '../components/StaffAbsencesSection';
import { StaffWeeklyHoursSection } from '../components/StaffWeeklyHoursSection';
import { useStaffAvailabilityEditor } from '../hooks/useStaffAvailabilityEditor';
import { parseTeamMemberRouteParams } from '../model/team-member-route-params';

type Editor = ReturnType<typeof useStaffAvailabilityEditor>;

function AvailabilitySections({ editor }: Readonly<{ editor: Editor }>): React.JSX.Element | null {
  const { availability, actions, draft } = editor;
  if (availability.data === undefined || draft === null) return null;

  return (
    <View style={REPORT_SECTION_STYLE}>
      <StaffWeeklyHoursSection
        editing={editor.editing}
        draft={draft}
        hasOwnHours={editor.hasOwnHours}
        canSave={editor.canSave}
        isBusy={actions.isBusy}
        onSave={editor.saveHours}
        onResetToCenterHours={editor.resetToCenterHours}
      />
      <StaffAbsencesSection
        absences={availability.data.absences}
        isBusy={actions.isBusy}
        affectedBookingCount={actions.lastAddedAbsence?.affectedBookingCount ?? 0}
        onAbsenceAdd={actions.addAbsence}
        onAbsenceRemove={actions.removeAbsence}
      />
      {actions.errorMessage === null ? null : <FormErrorBanner message={actions.errorMessage} />}
    </View>
  );
}

/** Prototipo `iavail`: horario semanal propio y ausencias de una persona del equipo. */
function StaffAvailabilityContent({
  membershipId,
}: Readonly<{ membershipId: string }>): React.JSX.Element {
  const router = useRouter();
  const editor = useStaffAvailabilityEditor(membershipId);
  const { availability } = editor;

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.availability.title')}
      subtitle={i18n.t('centerAdmin.availability.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {availability.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {availability.isError ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.availability.errorTitle')}
          error={availability.error}
          onRetry={() => void availability.refetch()}
          isRetrying={availability.isFetching}
        />
      ) : null}
      <AvailabilitySections editor={editor} />
    </ScreenTemplate>
  );
}

/** La administración edita la de cualquiera del equipo (`/(admin)/team/availability/[membershipId]`). */
export function TeamMemberAvailabilityScreen(): React.JSX.Element {
  const routeParams = parseTeamMemberRouteParams(useLocalSearchParams());
  if (routeParams === null) return <Redirect href="/(admin)/services" />;
  return <StaffAvailabilityContent membershipId={routeParams.membershipId} />;
}

/** Cada profesional edita la suya (`/(staff)/availability`). */
export function MyAvailabilityScreen(): React.JSX.Element | null {
  const activeCenterId = useSessionStore((state) => state.activeCenterId);
  const myCenters = useMyCenters();
  const membership = myCenters.data?.memberships.find(
    (candidate) => candidate.centerId === activeCenterId,
  );
  if (membership === undefined) return null;
  return <StaffAvailabilityContent membershipId={membership.membershipId} />;
}
