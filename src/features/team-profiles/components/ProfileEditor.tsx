import { View } from 'react-native';

import { VideoPlanNotice } from '@/features/videos';
import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { useProfileEditorState } from '../hooks/useProfileEditorState';
import { PROFILE_STATUS_TEXT_KEYS } from '../model/profile-status';
import { CertificationsEditor } from './CertificationsEditor';
import { ProfileEditorActions } from './ProfileEditorActions';
import { ProfileEditorFields } from './ProfileEditorFields';
import { ProfileStatusBadge } from './ProfileStatusBadge';
import { ProfileVideosSection } from './ProfileVideosSection';
import { PublishConsentRow } from './PublishConsentRow';
import { ROW_STYLE, STACK_STYLE } from './TeamProfiles.styles';

interface ProfileEditorProps {
  profile: ProfileResponseDto;
  centerName: string;
  clientWord: string;
  isVideoIncluded: boolean;
  onPreview: () => void;
}

function describeStatus(profile: ProfileResponseDto, clientWord: string): string {
  if (profile.status === 'changes_requested' && profile.reviewNote !== null) {
    return i18n.t('teamProfiles.editor.statusChanges', { note: profile.reviewNote });
  }
  return i18n.t(PROFILE_STATUS_TEXT_KEYS[profile.status], { clientWord });
}

function ProfileEditorHeader({
  profile,
  clientWord,
  onPreview,
}: Readonly<{
  profile: ProfileResponseDto;
  clientWord: string;
  onPreview: () => void;
}>): React.JSX.Element {
  return (
    <>
      <View style={ROW_STYLE}>
        <ProfileStatusBadge status={profile.status} />
        <Button
          size="sm"
          variant="secondary"
          label={i18n.t('teamProfiles.editor.previewAction', { clientWord })}
          onPress={onPreview}
        />
      </View>
      <Text color="ink2">{describeStatus(profile, clientWord)}</Text>
      {profile.status === 'published' ? (
        <Text variant="caption" color="ink2">
          {i18n.t('teamProfiles.editor.editWarning')}
        </Text>
      ) : null}
    </>
  );
}

/** Mi perfil profesional: se escribe, se guarda y se envía a revisión; el centro lo publica. */
export function ProfileEditor({
  profile,
  centerName,
  clientWord,
  isVideoIncluded,
  onPreview,
}: Readonly<ProfileEditorProps>): React.JSX.Element {
  const editor = useProfileEditorState(profile);

  return (
    <View style={STACK_STYLE}>
      <ProfileEditorHeader profile={profile} clientWord={clientWord} onPreview={onPreview} />
      {isVideoIncluded ? <ProfileVideosSection profile={profile} /> : <VideoPlanNotice />}
      <ProfileEditorFields draft={editor.draft} onDraftChange={editor.setDraft} />
      <CertificationsEditor certifications={profile.certifications} />
      <PublishConsentRow
        centerName={centerName}
        isGranted={editor.draft.hasPublishConsent}
        onToggle={(hasPublishConsent) => {
          editor.setDraft({ ...editor.draft, hasPublishConsent });
        }}
      />
      <ProfileEditorActions
        status={profile.status}
        hasChanges={editor.hasChanges}
        canSubmit={editor.canSubmit}
        isRunning={editor.isRunning}
        errorMessage={editor.errorMessage}
        onSave={editor.save}
        onSubmit={editor.submit}
      />
    </View>
  );
}
