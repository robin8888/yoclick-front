import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useActiveCenterSummary, useSignOut } from '@/features/auth';
import { DarkThemeRow, ProfileFooter, ProfileHeader } from '@/features/session';
import { useActiveCenterModules, useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { MORE_MENU_GROUPS, type MoreMenuGroup } from '../model/more-menu';
import { selectMoreMenuGroups } from '../model/more-menu-selection';
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

function MoreMenuSection({
  group,
  words,
}: Readonly<{ group: MoreMenuGroup; words: MoreMenuWords }>): React.JSX.Element {
  const router = useRouter();

  return (
    <View style={SECTION_STYLE}>
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
  );
}

/** Lo de cada día, siempre a la vista; lo que se toca pocas veces, plegado bajo «Más ajustes». */
function MoreMenuGroups({ words }: Readonly<{ words: MoreMenuWords }>): React.JSX.Element {
  const modules = useActiveCenterModules();
  const [areAdvancedShown, setAreAdvancedShown] = useState(false);
  const everydayGroups = selectMoreMenuGroups(MORE_MENU_GROUPS, { modules, isAdvanced: false });
  const advancedGroups = selectMoreMenuGroups(MORE_MENU_GROUPS, { modules, isAdvanced: true });

  return (
    <>
      {everydayGroups.map((group) => (
        <MoreMenuSection key={group.id} group={group} words={words} />
      ))}
      <ListItem
        leadingIconName="settings"
        title={i18n.t(
          areAdvancedShown
            ? 'centerAdmin.more.hideAdvancedTitle'
            : 'centerAdmin.more.showAdvancedTitle',
        )}
        subtitle={i18n.t('centerAdmin.more.advancedSubtitle')}
        accessibilityLabel={i18n.t(
          areAdvancedShown
            ? 'centerAdmin.more.hideAdvancedLabel'
            : 'centerAdmin.more.showAdvancedLabel',
        )}
        onPress={() => {
          setAreAdvancedShown((areShown) => !areShown);
        }}
      />
      {areAdvancedShown
        ? advancedGroups.map((group) => (
            <MoreMenuSection key={group.id} group={group} words={words} />
          ))
        : null}
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
