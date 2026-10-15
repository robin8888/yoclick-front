import { useQueryClient } from '@tanstack/react-query';
import { View } from 'react-native';

import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { Chip } from '@/ui/atoms/Chip';
import { Text } from '@/ui/atoms/Text';

import { useMyChildren } from '../hooks/useMyChildren';
import { CHIP_ROW_STYLE, SELECTOR_STYLE } from './ActingForSelector.styles';

/**
 * «Para: yo · Lucía · Pablo»: lo que ve y reserva un tutor para sí o para uno de sus hijos. No sale
 * a quien no es tutor. Al cambiar, todo lo cargado se vuelve a pedir en nombre de la otra persona.
 */
export function ActingForSelector(): React.JSX.Element | null {
  const queryClient = useQueryClient();
  const children = useMyChildren().data?.children ?? [];
  const actingFor = useSessionStore((state) => state.actingFor);
  const setActingFor = useSessionStore((state) => state.setActingFor);
  if (children.length === 0) return null;

  const choose = (child: { membershipId: string; fullName: string } | null): void => {
    setActingFor(child);
    void queryClient.invalidateQueries();
  };

  return (
    <View style={SELECTOR_STYLE}>
      <Text variant="caption" color="ink2">
        {i18n.t('guardians.actingFor')}
      </Text>
      <View style={CHIP_ROW_STYLE}>
        <Chip
          label={i18n.t('guardians.actingForMe')}
          isSelected={actingFor === null}
          selectionRole="radio"
          onPress={() => {
            choose(null);
          }}
        />
        {children.map((child) => (
          <Chip
            key={child.membershipId}
            label={child.fullName}
            isSelected={actingFor?.membershipId === child.membershipId}
            selectionRole="radio"
            onPress={() => {
              choose({ membershipId: child.membershipId, fullName: child.fullName });
            }}
          />
        ))}
      </View>
    </View>
  );
}
