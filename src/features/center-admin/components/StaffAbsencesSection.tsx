import { useState } from 'react';
import { View } from 'react-native';

import type {
  AddStaffAbsenceRequestDto,
  StaffAvailabilityResponseDtoAbsencesItem,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import { AbsenceAddForm } from './AbsenceAddForm';
import { createReportCardStyle } from './ReportCard.styles';

type Absence = StaffAvailabilityResponseDtoAbsencesItem;

const SECTION_STYLE = { gap: 12 } as const;
const ROW_STYLE = { flexDirection: 'row', alignItems: 'center', gap: 12 } as const;
const ROW_TEXT_STYLE = { flex: 1 } as const;

function describeRange(absence: Absence): string {
  const from = formatShortDate(new Date(`${absence.startsOn}T12:00:00Z`), 'UTC');
  if (absence.startsOn === absence.endsOn) {
    return i18n.t('centerAdmin.availability.singleDay', { date: from });
  }
  const to = formatShortDate(new Date(`${absence.endsOn}T12:00:00Z`), 'UTC');
  return i18n.t('centerAdmin.availability.dateRange', { from, to });
}

function AbsenceRow({
  absence,
  onRemove,
}: Readonly<{ absence: Absence; onRemove: () => void }>): React.JSX.Element {
  const range = describeRange(absence);

  return (
    <View style={ROW_STYLE}>
      <View style={ROW_TEXT_STYLE}>
        <Text variant="bodyStrong">{range}</Text>
        <Text variant="caption" color="ink2">
          {i18n.t(`centerAdmin.availability.reasons.${absence.reason}`)}
        </Text>
      </View>
      <IconButton
        iconName="close"
        variant="tonal"
        accessibilityLabel={i18n.t('centerAdmin.availability.removeAbsenceLabel', { range })}
        onPress={onRemove}
      />
    </View>
  );
}

interface AbsenceListProps {
  absences: readonly Absence[];
  onAbsenceRemove: (absenceId: string) => void;
}

function AbsenceList({ absences, onAbsenceRemove }: Readonly<AbsenceListProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createReportCardStyle(theme)}>
      {absences.length === 0 ? (
        <Text color="ink2">{i18n.t('centerAdmin.availability.absencesEmpty')}</Text>
      ) : (
        absences.map((absence) => (
          <AbsenceRow
            key={absence.id}
            absence={absence}
            onRemove={() => {
              onAbsenceRemove(absence.id);
            }}
          />
        ))
      )}
    </View>
  );
}

interface AbsenceAddControlProps {
  isBusy: boolean;
  onAbsenceAdd: (absence: AddStaffAbsenceRequestDto, onAdded: () => void) => void;
}

/** El botón «Añadir ausencia», que se convierte en el formulario al pulsarlo. */
function AbsenceAddControl({
  isBusy,
  onAbsenceAdd,
}: Readonly<AbsenceAddControlProps>): React.JSX.Element {
  const [isFormOpen, setIsFormOpen] = useState(false);
  if (!isFormOpen) {
    return (
      <Button
        variant="outline"
        leadingIconName="plus"
        label={i18n.t('centerAdmin.availability.addAbsenceAction')}
        onPress={() => {
          setIsFormOpen(true);
        }}
      />
    );
  }
  return (
    <AbsenceAddForm
      isBusy={isBusy}
      onSubmit={(absence) => {
        onAbsenceAdd(absence, () => {
          setIsFormOpen(false);
        });
      }}
    />
  );
}

interface StaffAbsencesSectionProps extends AbsenceAddControlProps, AbsenceListProps {
  affectedBookingCount: number;
}

/** Prototipo `iavail`, «Ausencias»: los días en los que no se puede reservar, con su motivo. */
export function StaffAbsencesSection({
  affectedBookingCount,
  ...controls
}: Readonly<StaffAbsencesSectionProps>): React.JSX.Element {
  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('centerAdmin.availability.absencesTitle')}
      </Text>
      <AbsenceList absences={controls.absences} onAbsenceRemove={controls.onAbsenceRemove} />
      {affectedBookingCount > 0 ? (
        <Text variant="caption" color="warning">
          {i18n.t('centerAdmin.availability.affectedBookings', { count: affectedBookingCount })}
        </Text>
      ) : null}
      <AbsenceAddControl isBusy={controls.isBusy} onAbsenceAdd={controls.onAbsenceAdd} />
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.availability.note')}
      </Text>
    </View>
  );
}
