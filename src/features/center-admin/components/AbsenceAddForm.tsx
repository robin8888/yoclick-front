import { useState } from 'react';
import { Pressable, View } from 'react-native';

import type { AddStaffAbsenceRequestDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';
import { useTheme } from '@/shared/theme';

import {
  ABSENCE_REASONS,
  buildAbsenceRequest,
  isValidAbsenceDraft,
  type AbsenceReason,
} from '../model/absence-form';
import { createFieldChoiceStyle, FIELD_CHOICES_STYLE } from './ImportColumnRow.styles';
import { SpanishDateField } from './SpanishDateField';

const FORM_STYLE = { gap: 12 } as const;

interface ReasonChoiceProps {
  reason: AbsenceReason;
  isSelected: boolean;
  onPress: () => void;
}

function ReasonChoice({
  reason,
  isSelected,
  onPress,
}: Readonly<ReasonChoiceProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      role="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      style={createFieldChoiceStyle(theme, isSelected)}
    >
      {isSelected ? <Icon name="check" size="inline" color="brandInk" /> : null}
      <Text variant="caption" color={isSelected ? 'brandInk' : 'ink'}>
        {i18n.t(`centerAdmin.availability.reasons.${reason}`)}
      </Text>
    </Pressable>
  );
}

interface ReasonChoicesProps {
  selectedReason: AbsenceReason;
  onReasonChange: (reason: AbsenceReason) => void;
}

function ReasonChoices({
  selectedReason,
  onReasonChange,
}: Readonly<ReasonChoicesProps>): React.JSX.Element {
  return (
    <>
      <Text variant="bodyStrong">{i18n.t('centerAdmin.availability.reasonLabel')}</Text>
      <View role="radiogroup" style={FIELD_CHOICES_STYLE}>
        {ABSENCE_REASONS.map((option) => (
          <ReasonChoice
            key={option}
            reason={option}
            isSelected={option === selectedReason}
            onPress={() => {
              onReasonChange(option);
            }}
          />
        ))}
      </View>
    </>
  );
}

interface AbsenceAddFormProps {
  isBusy: boolean;
  onSubmit: (absence: AddStaffAbsenceRequestDto) => void;
}

/** Fechas (`AAAA-MM-DD`) y motivo de una ausencia nueva; «hasta» vacío significa solo ese día. */
export function AbsenceAddForm({
  isBusy,
  onSubmit,
}: Readonly<AbsenceAddFormProps>): React.JSX.Element {
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [reason, setReason] = useState<AbsenceReason>('vacation');
  const request = buildAbsenceRequest({ startsOn, endsOn, reason });

  return (
    <View style={FORM_STYLE}>
      <SpanishDateField
        value={startsOn}
        onValueChange={setStartsOn}
        accessibilityLabel={i18n.t('centerAdmin.availability.fromLabel')}
      />
      <SpanishDateField
        value={endsOn}
        onValueChange={setEndsOn}
        accessibilityLabel={i18n.t('centerAdmin.availability.untilLabel')}
      />
      <ReasonChoices selectedReason={reason} onReasonChange={setReason} />
      <Button
        label={i18n.t('centerAdmin.availability.saveAbsenceAction')}
        isFullWidth
        isLoading={isBusy}
        isDisabled={!isValidAbsenceDraft(request)}
        onPress={() => {
          onSubmit(request);
        }}
      />
    </View>
  );
}
