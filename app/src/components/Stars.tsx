import { Pressable, View } from 'react-native';
import { Icon } from './Icon';
import { tap } from './ui';
import { colors } from '@/theme/tokens';

type Props = { value?: number; size?: number; onChange?: (v: number) => void; gap?: number };

export function Stars({ value = 0, size = 14, onChange, gap = 2 }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap }} accessibilityLabel={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Icon
            name="star"
            size={size}
            strokeWidth={1.2}
            color={n <= value ? colors.gold : colors.surfaceHigh}
          />
        );
        if (!onChange) return <View key={n}>{star}</View>;
        return (
          <Pressable
            key={n}
            hitSlop={6}
            onPress={() => {
              tap('select');
              onChange(n === value ? n - 1 : n);
            }}
            style={({ pressed }) => pressed && { transform: [{ scale: 1.25 }] }}
          >
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}
