import { useState } from 'react';
import { View } from 'react-native';

import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { BottomSheet } from '@/ui/organisms/BottomSheet';

import { useAddCertification, useRemoveCertification } from '../hooks/useTeamProfileMutations';
import { CertificationRow, RemoveCertificationButton } from './CertificationRows';
import { createListCardStyle, GROW_STYLE, ROW_STYLE, STACK_STYLE } from './TeamProfiles.styles';

const MAX_NAME_LENGTH = 120;

function AddCertificationForm({ onAdded }: Readonly<{ onAdded: () => void }>): React.JSX.Element {
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const add = useAddCertification();

  return (
    <View style={STACK_STYLE}>
      <Input
        value={name}
        onChangeText={setName}
        accessibilityLabel={i18n.t('teamProfiles.editor.certificationNameLabel')}
        placeholder={i18n.t('teamProfiles.editor.certificationNameLabel')}
        maxLength={MAX_NAME_LENGTH}
      />
      <Input
        value={detail}
        onChangeText={setDetail}
        accessibilityLabel={i18n.t('teamProfiles.editor.certificationDetailLabel')}
        placeholder={i18n.t('teamProfiles.editor.certificationDetailLabel')}
        maxLength={MAX_NAME_LENGTH}
      />
      {add.errorMessage === null ? null : <FormErrorBanner message={add.errorMessage} />}
      <Button
        variant="outline"
        isFullWidth
        leadingIconName="plus"
        label={i18n.t('teamProfiles.editor.addCertificationAction')}
        isLoading={add.isRunning}
        isDisabled={name.trim() === ''}
        onPress={() => {
          add.run({ name: name.trim(), detail: detail.trim() }, () => {
            setName('');
            setDetail('');
            onAdded();
          });
        }}
      />
    </View>
  );
}

function CertificationsHeader({
  onAddPress,
}: Readonly<{ onAddPress: () => void }>): React.JSX.Element {
  return (
    <View style={ROW_STYLE}>
      <View style={GROW_STYLE}>
        <Text variant="bodyStrong" role="heading">
          {i18n.t('teamProfiles.editor.certificationsTitle')}
        </Text>
        <Text variant="caption" color="ink2">
          {i18n.t('teamProfiles.editor.certificationsHint')}
        </Text>
      </View>
      <Button
        size="sm"
        variant="ghost"
        leadingIconName="plus"
        label={i18n.t('teamProfiles.editor.addShortAction')}
        accessibilityLabel={i18n.t('teamProfiles.editor.newCertificationTitle')}
        onPress={onAddPress}
      />
    </View>
  );
}

function CertificationList({
  certifications,
  onRemove,
}: Readonly<{
  certifications: ProfileResponseDto['certifications'];
  onRemove: (certificationId: string) => void;
}>): React.JSX.Element {
  const theme = useTheme();

  if (certifications.length === 0) {
    return <Text color="ink2">{i18n.t('teamProfiles.editor.noCertifications')}</Text>;
  }
  return (
    <View style={createListCardStyle(theme)}>
      {certifications.map((certification) => (
        <CertificationRow
          key={certification.id}
          certification={certification}
          action={
            <RemoveCertificationButton
              name={certification.name}
              onPress={() => {
                onRemove(certification.id);
              }}
            />
          }
        />
      ))}
    </View>
  );
}

/** Las titulaciones del perfil: se añaden desde una hoja y se quitan; el centro las verifica después. */
export function CertificationsEditor({
  certifications,
}: Readonly<{ certifications: ProfileResponseDto['certifications'] }>): React.JSX.Element {
  const removal = useRemoveCertification();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <View style={STACK_STYLE}>
      <CertificationsHeader
        onAddPress={() => {
          setIsAdding(true);
        }}
      />
      <CertificationList
        certifications={certifications}
        onRemove={(certificationId) => {
          removal.run(certificationId);
        }}
      />
      {removal.errorMessage === null ? null : <FormErrorBanner message={removal.errorMessage} />}
      <BottomSheet
        isVisible={isAdding}
        title={i18n.t('teamProfiles.editor.newCertificationTitle')}
        onDismiss={() => {
          setIsAdding(false);
        }}
      >
        <AddCertificationForm
          onAdded={() => {
            setIsAdding(false);
          }}
        />
      </BottomSheet>
    </View>
  );
}
