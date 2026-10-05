import { Pressable, View } from 'react-native';

import type { ServiceListResponseDtoServicesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { describeServiceMeta } from '../model/service-summary';
import {
  ADMIN_CARD_TEXT_STYLE,
  createAdminCardStyle,
  createIconTileStyle,
} from './AdminCard.styles';

interface ServiceRowProps {
  service: ServiceListResponseDtoServicesItem;
  onPress: () => void;
}

/** Un servicio del catálogo: nombre, duración y precio; si está oculto lo dice con palabra. */
export function ServiceRow({ service, onPress }: Readonly<ServiceRowProps>): React.JSX.Element {
  const theme = useTheme();
  const meta = describeServiceMeta(service);
  const spokenLabel = `${service.name}. ${meta}`;

  return (
    <Pressable
      role="button"
      accessibilityLabel={spokenLabel}
      onPress={onPress}
      style={createAdminCardStyle(theme)}
    >
      <View style={createIconTileStyle(theme)}>
        <Icon name="user" color="brandInk" />
      </View>
      <View style={ADMIN_CARD_TEXT_STYLE}>
        <Text variant="bodyStrong">{service.name}</Text>
        <Text variant="caption" color="ink2">
          {meta}
        </Text>
        {service.isVisible ? null : (
          <Text variant="caption" color="warning">
            {i18n.t('centerAdmin.services.hiddenLabel')}
          </Text>
        )}
      </View>
      <Icon name="chevronRight" color="ink2" />
    </Pressable>
  );
}
