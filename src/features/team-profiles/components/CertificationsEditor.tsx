import { useState } from 'react';
import { View } from 'react-native';

import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useAddCertification, useRemoveCertification } from '../hooks/useTeamProfileMutations';
import { CertificationRow, RemoveCertificationButton } from './CertificationRows';
import { ProfileSection } from './ProfileSection';
import { STACK_STYLE } from './TeamProfiles.styles';

const MAX_NAME_LENGTH = 120;

function AddCertificationForm(): React.JSX.Element {
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
        size="sm"
        variant="outline"
        leadingIconName="plus"
        label={i18n.t('teamProfiles.editor.addCertificationAction')}
        isLoading={add.isRunning}
        isDisabled={name.trim() === ''}
        onPress={() => {
          add.run({ name: name.trim(), detail: detail.trim() }, () => {
            setName('');
            setDetail('');
          });
        }}
      />
    </View>
  );
}

/** Las titulaciones del perfil: se añaden y se quitan; el centro las verifica después. */
export function CertificationsEditor({
  certifications,
}: Readonly<{ certifications: ProfileResponseDto['certifications'] }>): React.JSX.Element {
  const removal = useRemoveCertification();

  return (
    <ProfileSection
      title={i18n.t('teamProfiles.editor.certificationsTitle')}
      description={i18n.t('teamProfiles.editor.certificationsHint')}
    >
      {certifications.length === 0 ? (
        <Text color="ink2">{i18n.t('teamProfiles.editor.noCertifications')}</Text>
      ) : null}
      {certifications.map((certification) => (
        <CertificationRow
          key={certification.id}
          certification={certification}
          action={
            <RemoveCertificationButton
              name={certification.name}
              onPress={() => {
                removal.run(certification.id);
              }}
            />
          }
        />
      ))}
      {removal.errorMessage === null ? null : <FormErrorBanner message={removal.errorMessage} />}
      <AddCertificationForm />
    </ProfileSection>
  );
}
