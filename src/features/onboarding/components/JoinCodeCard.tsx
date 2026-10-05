import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { buildCenterJoinLink } from '../model/center-join-link';
import { createJoinCodeCardStyle } from './JoinCodeCard.styles';

interface JoinCodeCardProps {
  joinCode: string;
}

/** El código y el enlace con los que la clientela se une al centro. */
export function JoinCodeCard({ joinCode }: Readonly<JoinCodeCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createJoinCodeCardStyle(theme)}>
      <Text variant="overline" color="ink2">
        {i18n.t('onboarding.ready.joinCodeLabel')}
      </Text>
      <Text variant="display" color="brandInk" selectable>
        {joinCode}
      </Text>
      <Text variant="caption" color="ink2" selectable>
        {buildCenterJoinLink(joinCode)}
      </Text>
    </View>
  );
}
