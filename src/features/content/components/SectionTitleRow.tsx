import { View } from 'react-native';

import { Text } from '@/ui/atoms/Text';

const SECTION_TITLE_ROW_STYLE = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
} as const;

/** Un título de sección con un dato corto a la derecha («Biblioteca · 5 elementos»). */
export function SectionTitleRow({
  title,
  trailingText,
}: Readonly<{ title: string; trailingText: string }>): React.JSX.Element {
  return (
    <View style={SECTION_TITLE_ROW_STYLE}>
      <Text variant="titleMd" role="heading">
        {title}
      </Text>
      <Text variant="caption" color="ink2">
        {trailingText}
      </Text>
    </View>
  );
}
