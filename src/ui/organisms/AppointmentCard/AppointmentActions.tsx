import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createButtonRowStyle, createLinkStyle, LINK_ROW_STYLE } from './AppointmentCard.styles';
import type { AppointmentButtonAction, AppointmentLinkAction } from './AppointmentCard.types';

interface AppointmentButtonRowProps {
  actions: readonly AppointmentButtonAction[];
}

/** Los botones de la cita (reprogramar, cancelar), uno debajo de otro y a todo el ancho: así el texto cabe en una línea. */
export function AppointmentButtonRow({
  actions,
}: Readonly<AppointmentButtonRowProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createButtonRowStyle(theme)}>
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          label={action.label}
          {...(action.accessibilityLabel === undefined
            ? {}
            : { accessibilityLabel: action.accessibilityLabel })}
          {...(action.iconName === undefined ? {} : { leadingIconName: action.iconName })}
          isFullWidth
          onPress={action.onPress}
        />
      ))}
    </View>
  );
}

interface AppointmentLinkRowProps {
  actions: readonly AppointmentLinkAction[];
}

/** Enlaces con icono en el color de marca; desactivados pasan a gris y lo dicen al lector. */
export function AppointmentLinkRow({
  actions,
}: Readonly<AppointmentLinkRowProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={LINK_ROW_STYLE}>
      {actions.map((action) => {
        const isDisabled = action.isDisabled === true;
        const contentColor = isDisabled ? 'ink2' : 'brandInk';
        return (
          <Pressable
            key={action.label}
            role="button"
            accessibilityLabel={action.label}
            accessibilityState={{ disabled: isDisabled }}
            disabled={isDisabled}
            onPress={action.onPress}
            style={createLinkStyle(theme)}
          >
            <Icon name={action.iconName} size="inline" color={contentColor} />
            <Text variant="bodyStrong" color={contentColor}>
              {action.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
