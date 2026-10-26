import { useEffect, useRef, type RefObject } from 'react';
import {
  Pressable,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import {
  createWheelBandStyle,
  createWheelContentStyle,
  createWheelStyle,
  DEFAULT_WHEEL_VISIBLE_ITEMS,
  WHEEL_ITEM_HEIGHT,
  WHEEL_ITEM_STYLE,
} from './WheelColumn.styles';
import type { WheelColumnProps, WheelOption } from './WheelColumn.types';

interface WheelItemProps {
  option: WheelOption;
  isCentered: boolean;
  isSelected: boolean;
  onPress: () => void;
}

function WheelItem({
  option,
  isCentered,
  isSelected,
  onPress,
}: Readonly<WheelItemProps>): React.JSX.Element {
  return (
    <Pressable
      role="button"
      accessibilityLabel={option.accessibilityLabel}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={WHEEL_ITEM_STYLE}
    >
      <Text variant={isCentered ? 'titleMd' : 'body'} color={isCentered ? 'ink' : 'ink2'}>
        {option.label}
      </Text>
    </Pressable>
  );
}

/** Mantiene la rueda en la opción elegida y avisa de la que queda bajo la franja al soltar. */
function useWheelScroll(
  props: Readonly<WheelColumnProps>,
  scrollRef: RefObject<ScrollView | null>,
) {
  const { options, selectedValue, onValueChange } = props;
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === selectedValue),
    0,
  );

  // Sincroniza con un sistema externo (la posición del scroll nativo) cuando cambia lo elegido.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * WHEEL_ITEM_HEIGHT, animated: false });
  }, [scrollRef, selectedIndex, options.length]);

  return {
    selectedIndex,
    handleScrollSettle: (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      const rawIndex = Math.round(event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT);
      const settled = options[Math.min(Math.max(rawIndex, 0), options.length - 1)];
      if (settled !== undefined && settled.value !== selectedValue) onValueChange(settled.value);
    },
    handleItemPress: (index: number, value: string): void => {
      scrollRef.current?.scrollTo({ y: index * WHEEL_ITEM_HEIGHT, animated: true });
      onValueChange(value);
    },
  };
}

/**
 * Una rueda como la del selector de hora del iPhone: las opciones se deslizan y se paran de una
 * en una bajo la franja del centro. Cada opción también se puede tocar.
 */
export function WheelColumn(props: Readonly<WheelColumnProps>): React.JSX.Element {
  const theme = useTheme();
  const { options, selectedValue, accessibilityLabel } = props;
  const visibleItems = props.visibleItems ?? DEFAULT_WHEEL_VISIBLE_ITEMS;
  const scrollRef = useRef<ScrollView>(null);
  const wheel = useWheelScroll(props, scrollRef);

  return (
    <View style={createWheelStyle(visibleItems)} accessibilityLabel={accessibilityLabel}>
      <View pointerEvents="none" style={createWheelBandStyle(theme, visibleItems)} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        // En Android una rueda dentro de otro scroll (hoja, formulario) no recibe el gesto sin esto.
        nestedScrollEnabled
        snapToInterval={WHEEL_ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={wheel.handleScrollSettle}
        onScrollEndDrag={wheel.handleScrollSettle}
        contentContainerStyle={createWheelContentStyle(visibleItems)}
      >
        {options.map((option, index) => (
          <WheelItem
            key={option.value}
            option={option}
            isCentered={index === wheel.selectedIndex}
            isSelected={option.value === selectedValue}
            onPress={() => {
              wheel.handleItemPress(index, option.value);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}
