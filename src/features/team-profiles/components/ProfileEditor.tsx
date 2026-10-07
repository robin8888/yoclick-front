import { View } from 'react-native';

import { VideoPlanNotice } from '@/features/videos';
import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import { useProfileEditorState } from '../hooks/useProfileEditorState';
import { CertificationsEditor } from './CertificationsEditor';
import { ProfileEditorActions } from './ProfileEditorActions';
import { ProfileEditorFields } from './ProfileEditorFields';
import { ProfileHeaderCard } from './ProfileHeaderCard';
import { ProfileSection } from './ProfileSection';
import { ProfileVideosSection } from './ProfileVideosSection';
import { PublishConsentRow } from './PublishConsentRow';
import { WIDE_STACK_STYLE } from './TeamProfiles.styles';

interface ProfileEditorProps {
  profile: ProfileResponseDto;
  centerName: string;
  clientWord: string;
  isVideoIncluded: boolean;
  onPreview: () => void;
}

/** Mi perfil profesional: se escribe por secciones, se guarda y se envía a revisión; el centro lo publica. */
export function ProfileEditor({
  profile,
  centerName,
  clientWord,
  isVideoIncluded,
  onPreview,
}: Readonly<ProfileEditorProps>): React.JSX.Element {
  const editor = useProfileEditorState(profile);

  return (
    <View style={WIDE_STACK_STYLE}>
      <ProfileHeaderCard profile={profile} clientWord={clientWord} onPreview={onPreview} />
      {isVideoIncluded ? <ProfileVideosSection profile={profile} /> : <VideoPlanNotice />}
      <ProfileSection
        title={i18n.t('teamProfiles.editor.aboutYouTitle')}
        description={i18n.t('teamProfiles.editor.aboutYouHint', { clientWord })}
      >
        <ProfileEditorFields draft={editor.draft} onDraftChange={editor.setDraft} />
      </ProfileSection>
      <CertificationsEditor certifications={profile.certifications} />
      <ProfileSection>
        <PublishConsentRow
          centerName={centerName}
          isGranted={editor.draft.hasPublishConsent}
          onToggle={(hasPublishConsent) => {
            editor.setDraft({ ...editor.draft, hasPublishConsent });
          }}
        />
      </ProfileSection>
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
