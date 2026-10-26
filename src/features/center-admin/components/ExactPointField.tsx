import { useState } from 'react';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { parseLocationLink, type MapPoint } from '@/shared/lib/location-link';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormField } from '@/ui/molecules/FormField';

import { useCurrentPosition, type CurrentPositionStatus } from '../hooks/useCurrentPosition';

const SECTION_STYLE = { gap: 8 } as const;
const POINT_DECIMALS = 5;

const STATUS_MESSAGE_KEYS = {
  idle: null,
  locating: 'centerAdmin.location.locating',
  denied: 'centerAdmin.location.denied',
  failed: 'centerAdmin.location.failed',
} as const satisfies Record<CurrentPositionStatus, string | null>;

interface ExactPointFieldProps {
  /** El punto fijado a mano (GPS o enlace); `null` mientras no hay ninguno. */
  point: MapPoint | null;
  onPointChange: (point: MapPoint | null) => void;
}

function describePoint(point: MapPoint): string {
  return i18n.t('centerAdmin.location.pointSaved', {
    latitude: point.latitude.toFixed(POINT_DECIMALS),
    longitude: point.longitude.toFixed(POINT_DECIMALS),
  });
}

/** Lo pegado, mientras no sea un enlace con punto: dice por qué, sin bloquear nada. */
function PasteLinkField({
  onPointFound,
}: Readonly<{ onPointFound: (point: MapPoint) => void }>): React.JSX.Element {
  const [text, setText] = useState('');
  const isUnreadable = text.trim() !== '' && parseLocationLink(text) === null;

  return (
    <FormField
      label={i18n.t('centerAdmin.location.linkLabel')}
      placeholder={i18n.t('centerAdmin.location.linkPlaceholder')}
      helperText={i18n.t('centerAdmin.location.linkHelper')}
      errorMessage={isUnreadable ? i18n.t('centerAdmin.location.linkInvalid') : undefined}
      value={text}
      autoCapitalize="none"
      onChangeText={(nextText) => {
        const point = parseLocationLink(nextText);
        if (point === null) {
          setText(nextText);
          return;
        }
        setText('');
        onPointFound(point);
      }}
    />
  );
}

/** «Usar mi ubicación actual»: pide el permiso al pulsarlo y, si lo hay, guarda dónde está el móvil. */
function UseCurrentPositionButton({
  onPointFound,
}: Readonly<{ onPointFound: (point: MapPoint) => void }>): React.JSX.Element {
  const position = useCurrentPosition();
  const statusKey = STATUS_MESSAGE_KEYS[position.status];

  return (
    <>
      <Button
        variant="outline"
        isFullWidth
        leadingIconName="mapPin"
        label={i18n.t('centerAdmin.location.useCurrentAction')}
        isLoading={position.status === 'locating'}
        onPress={() => {
          position.locate(onPointFound);
        }}
      />
      {statusKey === null ? null : (
        <Text
          variant="caption"
          color={position.status === 'locating' ? 'ink2' : 'danger'}
          role="alert"
        >
          {i18n.t(statusKey)}
        </Text>
      )}
    </>
  );
}

/**
 * Fija el punto exacto de la clase cuando no hay una dirección que lo dé: con el GPS del móvil
 * (estando en el sitio) o pegando el enlace de ubicación que comparte WhatsApp o Google Maps.
 */
export function ExactPointField({
  point,
  onPointChange,
}: Readonly<ExactPointFieldProps>): React.JSX.Element {
  return (
    <View style={SECTION_STYLE}>
      <Text variant="bodyStrong">{i18n.t('centerAdmin.location.pointTitle')}</Text>
      <Text variant="caption" color="ink2" role={point === null ? undefined : 'status'}>
        {point === null ? i18n.t('centerAdmin.location.pointHint') : describePoint(point)}
      </Text>
      <UseCurrentPositionButton onPointFound={onPointChange} />
      <PasteLinkField onPointFound={onPointChange} />
      {point === null ? null : (
        <Button
          variant="ghost"
          isFullWidth
          label={i18n.t('centerAdmin.location.removePointAction')}
          onPress={() => {
            onPointChange(null);
          }}
        />
      )}
    </View>
  );
}
