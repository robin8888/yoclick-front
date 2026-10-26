import { useState } from 'react';

import type { MoveSessionRequestDto } from '@/shared/api/generated/model';
import type { SessionLocationFacts } from '@/shared/lib/session-location';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { BottomSheet } from '@/ui/organisms/BottomSheet';

import { useMoveSessionDay } from '../hooks/useMoveSessionDay';
import {
  buildLocationDraft,
  isLocationNameMissing,
  isSameLocationRequest,
  toLocationRequest,
  type LocationDraft,
} from '../model/location-draft';
import { SessionLocationFields } from './SessionLocationFields';
import { SpanishDateField } from './SpanishDateField';
import { TimeRangeStepFields } from './TimeRangeStepFields';

interface MoveSessionDayControlProps {
  sessionId: string;
  /** El día de la sesión (`AAAA-MM-DD`) y sus horas (`HH:MM`) en la zona del centro. */
  isoDate: string;
  startsAtTime: string;
  endsAtTime: string;
  /** Dónde se da ahora si no es en una sala del centro. */
  location: SessionLocationFacts | null;
}

interface MoveSessionDaySheetProps extends MoveSessionDayControlProps {
  isVisible: boolean;
  onClose: () => void;
}

interface MoveSessionDayButtonsProps {
  isMoving: boolean;
  isDisabled: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

function MoveSessionDayButtons({
  isMoving,
  isDisabled,
  onConfirm,
  onDismiss,
}: Readonly<MoveSessionDayButtonsProps>): React.JSX.Element {
  return (
    <>
      <Button
        isFullWidth
        label={i18n.t('centerAdmin.moveSession.confirm')}
        isLoading={isMoving}
        isDisabled={isDisabled}
        onPress={onConfirm}
      />
      <Button
        isFullWidth
        variant="ghost"
        label={i18n.t('centerAdmin.moveSession.dismiss')}
        onPress={onDismiss}
      />
    </>
  );
}

interface MoveSessionDayFieldsProps {
  timing: MoveSessionRequestDto;
  onTimingChange: (timing: MoveSessionRequestDto) => void;
}

/** El nuevo día y las nuevas horas de la sesión. */
function MoveSessionDayFields({
  timing,
  onTimingChange,
}: Readonly<MoveSessionDayFieldsProps>): React.JSX.Element {
  return (
    <>
      <SpanishDateField
        value={timing.date}
        onValueChange={(date) => {
          onTimingChange({ ...timing, date });
        }}
        accessibilityLabel={i18n.t('centerAdmin.moveSession.dateLabel')}
        isInitiallyOpen={false}
      />
      <TimeRangeStepFields
        title={i18n.t('centerAdmin.createClass.timeTitle')}
        startName={i18n.t('centerAdmin.createClass.timeFrom')}
        endName={i18n.t('centerAdmin.createClass.timeUntil')}
        startsAtTime={timing.startsAtTime}
        endsAtTime={timing.endsAtTime}
        onStartTimeChange={(startsAtTime) => {
          onTimingChange({ ...timing, startsAtTime });
        }}
        onEndTimeChange={(endsAtTime) => {
          onTimingChange({ ...timing, endsAtTime });
        }}
      />
    </>
  );
}

interface MoveSessionDayForm {
  timing: MoveSessionRequestDto;
  setTiming: (timing: MoveSessionRequestDto) => void;
  locationDraft: LocationDraft;
  setLocationDraft: (locationDraft: LocationDraft) => void;
  isNameMissing: boolean;
  isMoving: boolean;
  errorMessage: string | null;
  confirm: () => void;
}

/** Lo que se está cambiando de la sesión (día, horas y lugar) y cómo se envía al servidor. */
function useMoveSessionDayForm(props: Readonly<MoveSessionDaySheetProps>): MoveSessionDayForm {
  const { sessionId, isoDate, startsAtTime, endsAtTime, location, onClose } = props;
  const [timing, setTiming] = useState<MoveSessionRequestDto>({
    date: isoDate,
    startsAtTime,
    endsAtTime,
  });
  const [locationDraft, setLocationDraft] = useState<LocationDraft>(() =>
    buildLocationDraft(location),
  );
  const move = useMoveSessionDay(sessionId);

  return {
    timing,
    setTiming,
    locationDraft,
    setLocationDraft,
    isNameMissing: isLocationNameMissing(locationDraft),
    isMoving: move.isMoving,
    errorMessage: move.errorMessage,
    confirm: () => {
      const newLocation = toLocationRequest(locationDraft);
      const isLocationChanged = !isSameLocationRequest(newLocation, location);
      move.moveSessionDay(
        isLocationChanged ? { ...timing, location: newLocation } : timing,
        onClose,
      );
    },
  };
}

function MoveSessionDaySheet(props: Readonly<MoveSessionDaySheetProps>): React.JSX.Element {
  const form = useMoveSessionDayForm(props);

  return (
    <BottomSheet
      isVisible={props.isVisible}
      title={i18n.t('centerAdmin.moveSession.title')}
      onDismiss={props.onClose}
    >
      <Text color="ink2">{i18n.t('centerAdmin.moveSession.helper')}</Text>
      <MoveSessionDayFields timing={form.timing} onTimingChange={form.setTiming} />
      <SessionLocationFields
        value={form.locationDraft}
        onChange={form.setLocationDraft}
        nameErrorMessage={
          form.isNameMissing ? i18n.t('centerAdmin.location.nameRequired') : undefined
        }
      />
      {form.errorMessage === null ? null : <FormErrorBanner message={form.errorMessage} />}
      <MoveSessionDayButtons
        isMoving={form.isMoving}
        isDisabled={form.isNameMissing}
        onDismiss={props.onClose}
        onConfirm={form.confirm}
      />
    </BottomSheet>
  );
}

/** «Mover este día»: otra fecha u hora solo para esa sesión; el resto de la serie no cambia. */
export function MoveSessionDayControl(
  props: Readonly<MoveSessionDayControlProps>,
): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        isFullWidth
        variant="outline"
        label={i18n.t('centerAdmin.moveSession.action')}
        onPress={() => {
          setIsOpen(true);
        }}
      />
      <MoveSessionDaySheet
        {...props}
        isVisible={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      />
    </>
  );
}
