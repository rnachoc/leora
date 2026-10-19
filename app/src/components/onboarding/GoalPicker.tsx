import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../Icon';
import { tap } from '../ui';
import { useI18n } from '@/i18n/I18nProvider';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

const PRESETS = [6, 12, 24, 36, 52];

/** Big number with −/+ steppers and quick presets for the yearly reading goal. */
export function GoalPicker({
  value,
  suggested,
  onChange,
}: {
  value: number;
  suggested: number;
  onChange: (n: number) => void;
}) {
  const { t } = useI18n();
  const set = (n: number) => {
    tap('select');
    onChange(Math.max(1, Math.min(365, n)));
  };

  return (
    <View style={{ alignItems: 'center', gap: space.xl }}>
      <View style={styles.stepper}>
        <Pressable accessibilityLabel="−" onPress={() => set(value - 1)} style={styles.btn}>
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <View style={{ alignItems: 'center', minWidth: 140 }}>
          <Text style={styles.number}>{value}</Text>
          <Text style={type.label}>{t('onb.goal.unit')}</Text>
        </View>
        <Pressable accessibilityLabel="+" onPress={() => set(value + 1)} style={styles.btn}>
          <Icon name="plus" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.presets}>
        {[...new Set([suggested, ...PRESETS])]
          .sort((a, b) => a - b)
          .map((n) => (
            <Pressable key={n} onPress={() => set(n)} style={[styles.preset, value === n && styles.presetOn]}>
              <Text style={[styles.presetText, value === n && { color: colors.bg }]}>{n}</Text>
            </Pressable>
          ))}
      </View>

      <Text style={[type.small, { textAlign: 'center' }]}>✦ {t('onb.goal.suggested', { count: suggested })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginTop: space.lg },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  btnText: { fontFamily: fonts.medium, fontSize: 28, color: colors.text, lineHeight: 30 },
  number: { fontFamily: fonts.display, fontSize: 88, lineHeight: 96, color: colors.gold },
  presets: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  preset: {
    minWidth: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  presetText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
});
