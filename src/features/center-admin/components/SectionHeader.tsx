import { View } from 'react-native';

import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

const SECTION_HEADER_STYLE = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
} as const;

/** Título de sección con una acción a la derecha («Nuevo servicio»). */
export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
}: Readonly<SectionHeaderProps>): React.JSX.Element {
  return (
    <View style={SECTION_HEADER_STYLE}>
      <Text variant="titleMd" role="heading">
        {title}
      </Text>
      {actionLabel === undefined || onActionPress === undefined ? null : (
        <Button
          variant="ghost"
          size="sm"
          leadingIconName="plus"
          label={actionLabel}
          onPress={onActionPress}
        />
      )}
    </View>
  );
}
