import type { ParseKeys } from 'i18next';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useActiveCenterSummary } from '@/features/auth';
import { useActiveCenterSectorId } from '@/features/join';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { useTheme } from '@/shared/theme';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { createProfileListStyle } from './ClientProfileScreen.styles';
import { DarkThemeRow, ProfileFooter, ProfileHeader } from './ProfileParts';

function capitalize(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

interface ProfileLink {
  label: string;
  hint?: string;
  iconName: 'play' | 'file' | 'calendar' | 'user' | 'clock' | 'qrCode' | 'messageCircle' | 'trash';
  route:
    | '/(staff)/routines'
    | '/(staff)/content'
    | '/(staff)/public-profile'
    | '/(staff)/availability'
    | '/(staff)/attendance'
    | '/(staff)/work-qr'
    | '/(staff)/my-data'
    | '/(staff)/delete-account'
    | '/(staff)/messages';
}

interface ProfileLinkSpec {
  /** `null`: el nombre es la palabra del sector (rutinas, tareas…). */
  labelKey: ParseKeys | null;
  hintKey: ParseKeys | null;
  iconName: ProfileLink['iconName'];
  route: ProfileLink['route'];
}

/** Los accesos del perfil del equipo, con una línea que aclara para qué sirve cada uno. */
const STAFF_LINK_SPECS: readonly ProfileLinkSpec[] = [
  {
    labelKey: 'chat.title',
    hintKey: 'staffAgenda.instructor.home.messagesHint',
    iconName: 'messageCircle',
    route: '/(staff)/messages',
  },
  {
    labelKey: 'session.myData.title',
    hintKey: 'session.profile.myDataSubtitle',
    iconName: 'user',
    route: '/(staff)/my-data',
  },
  {
    labelKey: 'timeClock.title',
    hintKey: 'staffAgenda.instructor.home.attendanceHint',
    iconName: 'clock',
    route: '/(staff)/attendance',
  },
  {
    labelKey: 'timeClock.workQrAction',
    hintKey: 'staffAgenda.instructor.home.workQrHint',
    iconName: 'qrCode',
    route: '/(staff)/work-qr',
  },
  {
    labelKey: null,
    hintKey: 'staffAgenda.instructor.home.routinesHint',
    iconName: 'play',
    route: '/(staff)/routines',
  },
  {
    labelKey: 'content.admin.title',
    hintKey: 'staffAgenda.instructor.home.contentHint',
    iconName: 'file',
    route: '/(staff)/content',
  },
  {
    labelKey: 'teamProfiles.editor.title',
    hintKey: null,
    iconName: 'user',
    route: '/(staff)/public-profile',
  },
  {
    labelKey: 'session.profile.availabilityAction',
    hintKey: 'staffAgenda.instructor.home.availabilityHint',
    iconName: 'calendar',
    route: '/(staff)/availability',
  },
  {
    labelKey: 'privacy.delete.openAction',
    hintKey: 'privacy.delete.staffHint',
    iconName: 'trash',
    route: '/(staff)/delete-account',
  },
];

function buildStaffLinks(routineWordPlural: string): readonly ProfileLink[] {
  return STAFF_LINK_SPECS.map((spec) => ({
    label: spec.labelKey === null ? capitalize(routineWordPlural) : i18n.t(spec.labelKey),
    ...(spec.hintKey === null ? {} : { hint: i18n.t(spec.hintKey) }),
    iconName: spec.iconName,
    route: spec.route,
  }));
}

function StaffProfileLinks({
  routineWordPlural,
}: Readonly<{ routineWordPlural: string }>): React.JSX.Element {
  const router = useRouter();
  const theme = useTheme();
  const links = buildStaffLinks(routineWordPlural);
  return (
    <View style={createProfileListStyle(theme)}>
      {links.map((link) => (
        <ListItem
          key={link.route}
          leadingIconName={link.iconName}
          title={link.label}
          subtitle={link.hint}
          onPress={() => {
            router.push(link.route);
          }}
        />
      ))}
      <DarkThemeRow />
    </View>
  );
}

/** Prototipo `iagenda` › Perfil: igual que el del alumno y el del centro. */
export function StaffProfileScreen(): React.JSX.Element {
  const onBackPress = useBackAction();
  const center = useActiveCenterSummary();
  const vocabulary = getSectorVocabulary(useActiveCenterSectorId());
  const { signOut, isSigningOut } = useSignOutFlow();

  return (
    <ScreenTemplate
      onBackPress={onBackPress}
      title={i18n.t('session.profile.title')}
      isLoading={isSigningOut}
    >
      <ProfileHeader roleLabel={capitalize(vocabulary.staff.singular)} centerName={center.name} />
      <StaffProfileLinks routineWordPlural={vocabulary.routine.plural} />
      <ProfileFooter isSigningOut={isSigningOut} onSignOut={signOut} />
    </ScreenTemplate>
  );
}
