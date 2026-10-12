import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import type { EnrollmentListResponseDtoEnrollmentsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatNumericDate } from '@/shared/lib/format';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

import { useScheduleEnrollments } from '../hooks/useScheduleEnrollments';
import { useUnenrollClient } from '../hooks/useUnenrollClient';
import { SectionHeader } from './SectionHeader';

type Enrollment = EnrollmentListResponseDtoEnrollmentsItem;

const SECTION_STYLE = { gap: 12 } as const;
const ROW_STYLE = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
} as const;
const ROW_TEXT_STYLE = { flex: 1, gap: 2 } as const;

interface EnrollmentRowProps {
  enrollment: Enrollment;
  onRemovePress: () => void;
}

function EnrollmentRow({
  enrollment,
  onRemovePress,
}: Readonly<EnrollmentRowProps>): React.JSX.Element {
  return (
    <View style={ROW_STYLE}>
      <View style={ROW_TEXT_STYLE}>
        <Text variant="bodyStrong">{enrollment.client.fullName}</Text>
        <Text variant="caption" color="ink2">
          {i18n.t('centerAdmin.schedules.enrollmentSince', {
            date: formatNumericDate(enrollment.startsOn),
          })}
        </Text>
      </View>
      <IconButton
        iconName="trash"
        accessibilityLabel={i18n.t('centerAdmin.schedules.unenrollLabel', {
          name: enrollment.client.fullName,
        })}
        onPress={onRemovePress}
      />
    </View>
  );
}

interface EnrollmentRowsProps {
  enrollments: ReturnType<typeof useScheduleEnrollments>;
  activeEnrollments: readonly Enrollment[];
  onRemovePress: (enrollment: Enrollment) => void;
}

/** Error, vacío o una fila por persona matriculada. */
function EnrollmentRows({
  enrollments,
  activeEnrollments,
  onRemovePress,
}: Readonly<EnrollmentRowsProps>): React.JSX.Element {
  return (
    <>
      {enrollments.isError ? (
        <Text color="danger" role="alert">
          {i18n.t('centerAdmin.schedules.enrollmentsLoadError')}
        </Text>
      ) : null}
      {enrollments.isSuccess && activeEnrollments.length === 0 ? (
        <Text color="ink2">{i18n.t('centerAdmin.schedules.enrollmentsEmpty')}</Text>
      ) : null}
      {activeEnrollments.map((enrollment) => (
        <EnrollmentRow
          key={enrollment.id}
          enrollment={enrollment}
          onRemovePress={() => {
            onRemovePress(enrollment);
          }}
        />
      ))}
    </>
  );
}

interface UnenrollSheetProps {
  seriesId: string;
  enrollment: Enrollment | null;
  onClose: () => void;
}

/** Confirmación de la baja: las citas futuras del grupo se cancelan sin consumir bono. */
function UnenrollSheet({
  seriesId,
  enrollment,
  onClose,
}: Readonly<UnenrollSheetProps>): React.JSX.Element {
  const unenroll = useUnenrollClient(seriesId);

  return (
    <>
      {unenroll.errorMessage === null ? null : <FormErrorBanner message={unenroll.errorMessage} />}
      <ConfirmSheet
        isVisible={enrollment !== null}
        title={i18n.t('centerAdmin.schedules.unenrollTitle', {
          name: enrollment?.client.fullName ?? '',
        })}
        message={i18n.t('centerAdmin.schedules.unenrollMessage')}
        confirmLabel={i18n.t('centerAdmin.schedules.unenrollConfirm')}
        dismissLabel={i18n.t('actions.cancel')}
        isConfirming={unenroll.isUnenrolling}
        isDestructive
        onConfirm={() => {
          if (enrollment !== null) unenroll.unenrollClient(enrollment.id, onClose);
        }}
        onDismiss={onClose}
      />
    </>
  );
}

interface EnrollmentsSectionProps {
  seriesId: string;
  capacity: number;
  canEnroll: boolean;
}

/** El grupo fijo: quién está matriculado, «Matricular» y la baja con confirmación. */
export function EnrollmentsSection({
  seriesId,
  capacity,
  canEnroll,
}: Readonly<EnrollmentsSectionProps>): React.JSX.Element {
  const router = useRouter();
  const enrollments = useScheduleEnrollments(seriesId);
  const [enrollmentToRemove, setEnrollmentToRemove] = useState<Enrollment | null>(null);
  const activeEnrollments = (enrollments.data?.enrollments ?? []).filter(
    (enrollment) => enrollment.status === 'active',
  );

  return (
    <View style={SECTION_STYLE}>
      <SectionHeader
        title={i18n.t('centerAdmin.schedules.enrollmentsTitle', {
          enrolled: activeEnrollments.length,
          capacity,
        })}
        actionLabel={canEnroll ? i18n.t('centerAdmin.schedules.enrollAction') : undefined}
        onActionPress={() => {
          router.push({ pathname: '/(admin)/schedules/enroll/[seriesId]', params: { seriesId } });
        }}
      />
      <EnrollmentRows
        enrollments={enrollments}
        activeEnrollments={activeEnrollments}
        onRemovePress={setEnrollmentToRemove}
      />
      <UnenrollSheet
        seriesId={seriesId}
        enrollment={enrollmentToRemove}
        onClose={() => {
          setEnrollmentToRemove(null);
        }}
      />
    </View>
  );
}
