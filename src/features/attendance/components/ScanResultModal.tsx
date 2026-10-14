import { useEffect } from 'react';
import { AccessibilityInfo, Modal, View } from 'react-native';

import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import type { CheckInResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Badge } from '@/ui/atoms/Badge';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import type { ScanVerdict } from '../model/scan-verdict';
import { ScanResultDetails } from './ScanResultDetails';
import {
  createScanAnchorStyle,
  createScanBackdropVeilStyle,
  createScanCardStyle,
  createVerdictIconStyle,
} from './ScanResultModal.styles';

interface ScanResultModalProps {
  /** El resultado del escaneo; `null` mantiene el modal cerrado. */
  checkIn: CheckInResponseDto | null;
  verdict: ScanVerdict | null;
  onScanAnother: () => void;
}

/** Las fotos firmadas del servidor vienen completas; una ruta relativa se completa con la API. */
function resolvePhotoUrl(photoUrl: string | null): string | null {
  if (photoUrl === null || photoUrl === '') return null;
  return photoUrl.startsWith('/') ? resolveApiAssetUrl(photoUrl) : photoUrl;
}

interface ScanResultCardProps {
  checkIn: CheckInResponseDto;
  verdict: ScanVerdict;
  onScanAnother: () => void;
}

function ScanResultCard({
  checkIn,
  verdict,
  onScanAnother,
}: Readonly<ScanResultCardProps>): React.JSX.Element {
  const theme = useTheme();
  const { isGranted } = verdict;

  return (
    <View style={createScanCardStyle(theme, isGranted)}>
      <View style={createVerdictIconStyle(theme, isGranted)}>
        <Icon name={isGranted ? 'check' : 'close'} size="large" color="surface" />
      </View>
      <Text variant="titleMd" color={isGranted ? 'success' : 'danger'} role="heading">
        {verdict.headline}
      </Text>
      <Avatar
        name={checkIn.person.fullName}
        photoUrl={resolvePhotoUrl(checkIn.person.photoUrl)}
        size="xl"
        isDecorative
      />
      <Text variant="titleMd" align="center">
        {checkIn.person.fullName}
      </Text>
      <Badge tone="neutral" label={verdict.roleLabel} />
      <ScanResultDetails checkIn={checkIn} verdict={verdict} />
      <Button
        variant="secondary"
        label={i18n.t('attendance.scan.scanAnotherAction')}
        isFullWidth
        onPress={onScanAnother}
      />
    </View>
  );
}

/**
 * Tras escanear: quién es (foto, nombre y rol) y, en verde o en rojo y con palabras, si puede
 * entrar. El color nunca va solo: «Puede entrar» / «No puede entrar» y el motivo lo acompañan.
 */
export function ScanResultModal({
  checkIn,
  verdict,
  onScanAnother,
}: Readonly<ScanResultModalProps>): React.JSX.Element {
  const theme = useTheme();
  const announcement =
    checkIn === null || verdict === null ? null : `${verdict.headline}. ${checkIn.person.fullName}`;

  useEffect(() => {
    if (announcement !== null) AccessibilityInfo.announceForAccessibility(announcement);
  }, [announcement]);

  return (
    <Modal
      visible={checkIn !== null}
      transparent
      animationType="fade"
      onRequestClose={onScanAnother}
      accessibilityViewIsModal
    >
      <View style={createScanAnchorStyle(theme)}>
        <View style={createScanBackdropVeilStyle(theme)} pointerEvents="none" />
        {checkIn === null || verdict === null ? null : (
          <ScanResultCard checkIn={checkIn} verdict={verdict} onScanAnother={onScanAnother} />
        )}
      </View>
    </Modal>
  );
}
