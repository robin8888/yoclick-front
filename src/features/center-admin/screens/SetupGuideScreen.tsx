import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, hasRoomManagement, i18n } from '@/shared/i18n';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { buildSetupGuideGroups, type SetupGuideStep } from '../model/setup-guide-steps';
import { SECTION_STYLE } from './AdminMoreScreen.styles';

/** Las palabras del sector que llevan los textos de la guía. */
interface SetupGuideWords {
  clientWord: string;
  clientSingular: string;
  staffWord: string;
}

interface SetupGuideStepRowProps {
  step: SetupGuideStep;
  words: SetupGuideWords;
  onPress: () => void;
}

function SetupGuideStepRow({
  step,
  words,
  onPress,
}: Readonly<SetupGuideStepRowProps>): React.JSX.Element {
  const title = i18n.t(`centerAdmin.setupGuide.steps.${step.id}.title`, { ...words });

  return (
    <ListItem
      leadingIconName={step.iconName}
      title={`${String(step.position)}. ${title}`}
      subtitle={i18n.t(`centerAdmin.setupGuide.steps.${step.id}.description`, { ...words })}
      onPress={onPress}
    />
  );
}

/**
 * «Primeros pasos»: lo que un centro hace, en orden, para funcionar del todo con la app. Cada paso
 * lleva a su pantalla; los textos usan las palabras del sector (alumnos, clientes, pacientes…).
 */
export function SetupGuideScreen(): React.JSX.Element {
  const router = useRouter();
  const onBackPress = useBackAction();
  const sectorId = useActiveCenterSectorId();
  const { client, staff } = getSectorVocabulary(sectorId);
  const words = {
    clientWord: client.plural,
    clientSingular: client.singular,
    staffWord: staff.plural,
  };
  const groups = buildSetupGuideGroups({ canManageSpaces: hasRoomManagement(sectorId) });

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.setupGuide.title')}
      subtitle={i18n.t('centerAdmin.setupGuide.subtitle')}
      onBackPress={onBackPress}
    >
      {groups.map((group) => (
        <View key={group.id} style={SECTION_STYLE}>
          <Text variant="overline" color="ink2">
            {i18n.t(`centerAdmin.setupGuide.groups.${group.id}`)}
          </Text>
          {group.steps.map((step) => (
            <SetupGuideStepRow
              key={step.id}
              step={step}
              words={words}
              onPress={() => {
                router.push(step.route);
              }}
            />
          ))}
        </View>
      ))}
    </ScreenTemplate>
  );
}
