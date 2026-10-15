import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useActiveCenterSummary, useSignOut } from '@/features/auth';
import { DarkThemeRow, ProfileFooter, ProfileHeader } from '@/features/session';
import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { MORE_MENU_GROUPS } from '../model/more-menu';
import { SECTION_STYLE } from './AdminMoreScreen.styles';

/** Las palabras del sector que llevan los textos del menú. */
interface MoreMenuWords {
  clientWord: string;
  routineWordPlural: string;
  clientSingular: string;
  staffSingular: string;
}

function useMoreMenuWords(): MoreMenuWords {
  const { client, routine, staff } = getSectorVocabulary(useActiveCenterSectorId());
  return {
    clientWord: client.plural,
    routineWordPlural: routine.plural,
    clientSingular: client.singular,
    staffSingular: staff.singular,
  };
}

function MoreMenuGroups({ words }: Readonly<{ words: MoreMenuWords }>): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      {MORE_MENU_GROUPS.map((group) => (
        <View key={group.id} style={SECTION_STYLE}>
          <Text variant="overline" color="ink2">
            {i18n.t(`centerAdmin.more.${group.id}Section`)}
          </Text>
          {group.entries.map((entry) => (
            <ListItem
              key={entry.textKey}
              leadingIconName={entry.iconName}
              title={i18n.t(`centerAdmin.more.${entry.textKey}Title`, { ...words })}
              subtitle={i18n.t(`centerAdmin.more.${entry.textKey}Subtitle`)}
              onPress={() => {
                router.push(entry.route);
              }}
            />
          ))}
        </View>
      ))}
    </>
  );
}

/** Prototipo `amore`: igual que el perfil del alumno y el del profesor, con los accesos de administración. */
export function AdminMoreScreen(): React.JSX.Element {
  const onBackPress = useBackAction();
  const { signOut, isSigningOut } = useSignOut();
  const center = useActiveCenterSummary();
  const words = useMoreMenuWords();

  return (
    <ScreenTemplate
      onBackPress={onBackPress}
      title={i18n.t('centerAdmin.more.title')}
      isLoading={isSigningOut}
    >
      <ProfileHeader
        roleLabel={i18n.t('session.profile.administrationRole')}
        centerName={center.name}
      />
      <MoreMenuGroups words={words} />
      <DarkThemeRow />
      <ProfileFooter isSigningOut={isSigningOut} onSignOut={signOut} />
    </ScreenTemplate>
  );
}
