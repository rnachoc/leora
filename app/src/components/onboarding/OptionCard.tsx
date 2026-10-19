import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../Icon';
import { tap } from '../ui';
import { colors, fonts, radius, space } from '@/theme/tokens';

type Props = {
  emoji?: string;
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  /** Compact tile for grids (genres) instead of a full-width row. */
  compact?: boolean;
};

/** Selectable answer used across the questionnaire (single- or multi-choice). */
export function OptionCard({ emoji, title, description, selected, onPress, compact }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={() => {
        tap('select');
        onPress();
      }}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compact,
        selected && styles.selected,
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      {emoji ? <Text style={compact ? styles.emojiSmall : styles.emoji}>{emoji}</Text> : null}
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, compact && { fontSize: 14 }, selected && { color: colors.bg }]}>{title}</Text>
        {description ? (
          <Text style={[styles.description, selected && { color: 'rgba(14,12,10,0.7)' }]}>{description}</Text>
        ) : null}
      </View>
      {!compact && (
        <View style={[styles.check, selected && styles.checkOn]}>
          {selected && <Icon name="check" size={14} color={colors.gold} strokeWidth={2.6} />}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compact: { width: '48%', flexGrow: 1, padding: space.md, gap: 10 },
  selected: { backgroundColor: colors.gold, borderColor: colors.gold },
  emoji: { fontSize: 26 },
  emojiSmall: { fontSize: 20 },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  description: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.bg, borderColor: colors.bg },
});
