import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { useActiveCenterSummary } from '@/features/auth';
import { LoadErrorState } from '@/features/join';
import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ProfileDetailView } from '../components/ProfileDetailView';
import { ReviewForm } from '../components/ReviewForm';
import { useTeamProfile } from '../hooks/useTeamProfileQueries';
import { parseTeamMemberRouteParams } from '../model/team-route-params';

function firstNameOf(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName;
}

/** El botón de valorar y, al tocarlo, el formulario de la opinión. */
function ReviewAction({ profile }: Readonly<{ profile: ProfileResponseDto }>): React.JSX.Element {
  const [isReviewing, setIsReviewing] = useState(false);

  if (isReviewing) {
    return (
      <ReviewForm
        membershipId={profile.membershipId}
        name={firstNameOf(profile.fullName)}
        onClose={() => {
          setIsReviewing(false);
        }}
      />
    );
  }
  return (
    <Button
      size="sm"
      variant="outline"
      label={i18n.t('teamProfiles.profile.reviewAction')}
      onPress={() => {
        setIsReviewing(true);
      }}
    />
  );
}

/** «Reservar con…»: lleva a elegir el servicio y, desde ahí, directo a los huecos de esa persona. */
function BookWithButton({ profile }: Readonly<{ profile: ProfileResponseDto }>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      isFullWidth
      label={i18n.t('teamProfiles.profile.bookAction', { name: firstNameOf(profile.fullName) })}
      onPress={() => {
        router.push({
          pathname: '/(client)/(tabs)/book',
          params: { staffMembershipId: profile.membershipId },
        });
      }}
    />
  );
}

function TeamMemberProfileBody({
  membershipId,
}: Readonly<{ membershipId: string }>): React.JSX.Element {
  const profile = useTeamProfile(membershipId);
  const center = useActiveCenterSummary();

  if (profile.isPending) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (profile.isError) {
    return (
      <LoadErrorState
        title={i18n.t('teamProfiles.profile.notFound')}
        error={profile.error}
        onRetry={() => void profile.refetch()}
        isRetrying={profile.isFetching}
      />
    );
  }
  return (
    <ProfileDetailView
      profile={profile.data}
      centerName={center.name}
      reviewsAction={<ReviewAction profile={profile.data} />}
    />
  );
}

function TeamMemberProfileContent({
  membershipId,
}: Readonly<{ membershipId: string }>): React.JSX.Element {
  const router = useRouter();
  const profile = useTeamProfile(membershipId);

  return (
    <ScreenTemplate
      title={profile.data?.fullName ?? ''}
      subtitle={profile.data?.staffTitle ?? undefined}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={profile.data === undefined ? undefined : <BookWithButton profile={profile.data} />}
    >
      <TeamMemberProfileBody membershipId={membershipId} />
    </ScreenTemplate>
  );
}

/** Prototipo `tprof`: el perfil de una persona del equipo, con sus opiniones y «Reservar con…». */
export function TeamMemberProfileScreen(): React.JSX.Element {
  const params = parseTeamMemberRouteParams(useLocalSearchParams());
  if (params === null) return <Redirect href="/(client)/team" />;
  return <TeamMemberProfileContent membershipId={params.membershipId} />;
}
