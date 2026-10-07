import { View } from 'react-native';

import { PlayableVideo } from '@/features/videos';
import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { CertificationRow } from './CertificationRows';
import { RatingSummaryLine } from './RatingSummaryLine';
import { ReviewsList } from './ReviewsList';
import { createCardStyle, STACK_STYLE, WRAP_ROW_STYLE } from './TeamProfiles.styles';

interface ProfileDetailViewProps {
  profile: ProfileResponseDto;
  centerName: string;
  /** Algo que va entre el perfil y las opiniones (el botón de valorar). */
  reviewsAction?: React.ReactNode;
  shouldShowReviews?: boolean;
}

function Chips({ items }: Readonly<{ items: readonly string[] }>): React.JSX.Element {
  return (
    <View style={WRAP_ROW_STYLE}>
      {items.map((item) => (
        <Badge key={item} label={item} tone="brand" />
      ))}
    </View>
  );
}

function TechniqueAndCertifications({
  profile,
  centerName,
}: Readonly<{ profile: ProfileResponseDto; centerName: string }>): React.JSX.Element {
  const theme = useTheme();
  const hasVerified = profile.certifications.some(({ isVerified }) => isVerified);

  return (
    <>
      {profile.techniqueVideos.length === 0 ? null : (
        <View style={STACK_STYLE}>
          <Text variant="titleMd" role="heading">
            {i18n.t('teamProfiles.profile.techniqueTitle')}
          </Text>
          {profile.techniqueVideos.map((video) => (
            <PlayableVideo key={video.id} video={video} shouldShowTitle />
          ))}
        </View>
      )}
      {profile.certifications.length === 0 ? null : (
        <View style={STACK_STYLE}>
          <Text variant="titleMd" role="heading">
            {i18n.t('teamProfiles.profile.certificationsTitle')}
          </Text>
          <View style={createCardStyle(theme)}>
            {profile.certifications.map((certification) => (
              <CertificationRow key={certification.id} certification={certification} />
            ))}
          </View>
          {hasVerified ? (
            <Text variant="caption" color="ink2">
              {i18n.t('teamProfiles.profile.verifiedNote', { centerName })}
            </Text>
          ) : null}
        </View>
      )}
    </>
  );
}

/** Cómo ve la clientela un perfil: vídeo, titular, especialidades, biografía, titulaciones y opiniones. */
export function ProfileDetailView({
  profile,
  centerName,
  reviewsAction,
  shouldShowReviews = true,
}: Readonly<ProfileDetailViewProps>): React.JSX.Element {
  return (
    <View style={STACK_STYLE}>
      {profile.introVideo === null ? null : <PlayableVideo video={profile.introVideo} />}
      {profile.headline === null ? null : <Text variant="titleMd">{profile.headline}</Text>}
      <RatingSummaryLine rating={profile.rating} />
      <Chips items={profile.specialties} />
      {profile.bio === null ? null : (
        <View style={STACK_STYLE}>
          <Text variant="titleMd" role="heading">
            {i18n.t('teamProfiles.profile.aboutTitle')}
          </Text>
          <Text>{profile.bio}</Text>
          {profile.languages.length === 0 ? null : (
            <Text variant="caption" color="ink2">
              {i18n.t('teamProfiles.profile.languagesLine', {
                languages: profile.languages.join(', '),
              })}
            </Text>
          )}
        </View>
      )}
      <TechniqueAndCertifications profile={profile} centerName={centerName} />
      {reviewsAction}
      {shouldShowReviews ? <ReviewsList membershipId={profile.membershipId} /> : null}
    </View>
  );
}
