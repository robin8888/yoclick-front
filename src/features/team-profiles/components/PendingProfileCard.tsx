import { View } from 'react-native';

import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useVerifyCertification } from '../hooks/useTeamProfileMutations';
import { ProfileDecisionControls } from './ProfileDecisionControls';
import { ProfileDetailView } from './ProfileDetailView';
import { createCardStyle, STACK_STYLE } from './TeamProfiles.styles';

function VerifyCertifications({
  profile,
}: Readonly<{ profile: ProfileResponseDto }>): React.JSX.Element {
  const verification = useVerifyCertification();
  const unverified = profile.certifications.filter(({ isVerified }) => !isVerified);

  return (
    <View style={STACK_STYLE}>
      {unverified.map((certification) => (
        <Button
          key={certification.id}
          size="sm"
          variant="secondary"
          leadingIconName="check"
          label={`${i18n.t('teamProfiles.admin.verifyAction')}: ${certification.name}`}
          accessibilityLabel={i18n.t('teamProfiles.admin.verifyLabel', {
            name: certification.name,
          })}
          isDisabled={verification.isRunning}
          onPress={() => {
            verification.run({
              membershipId: profile.membershipId,
              certificationId: certification.id,
            });
          }}
        />
      ))}
      {verification.errorMessage === null ? null : (
        <FormErrorBanner message={verification.errorMessage} />
      )}
    </View>
  );
}

/** Un perfil que espera la revisión: se ve como lo verá la clientela, se verifican sus titulaciones y se decide. */
export function PendingProfileCard({
  profile,
  centerName,
}: Readonly<{ profile: ProfileResponseDto; centerName: string }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCardStyle(theme)}>
      <Text variant="titleMd">{profile.fullName}</Text>
      <ProfileDetailView profile={profile} centerName={centerName} shouldShowReviews={false} />
      <VerifyCertifications profile={profile} />
      <ProfileDecisionControls membershipId={profile.membershipId} />
    </View>
  );
}
