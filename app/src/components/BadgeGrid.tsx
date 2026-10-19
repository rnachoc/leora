import { StyleSheet, Text, View } from 'react-native';
import { useI18n } from '@/i18n/I18nProvider';
import { badgeDesc, badgeLabel, type Badge } from '@/lib/stats';
import { colors, fonts, radius, space } from '@/theme/tokens';

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  const { t } = useI18n();
  return (
    <View style={styles.grid}>
      {badges.map((b) => (
        <View key={b.id} style={[styles.badge, !b.unlocked && styles.locked]}>
          <View style={[styles.medal, b.unlocked && styles.medalOn]}>
            <Text style={[styles.icon, !b.unlocked && { opacity: 0.35 }]}>{b.unlocked ? b.icon : '🔒'}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {t(badgeLabel(b.id))}
          </Text>
          <Text style={styles.desc} numberOfLines={2}>
            {t(badgeDesc(b.id))}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locked: { opacity: 0.6 },
  medal: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHigh,
    marginBottom: 8,
  },
  medalOn: { backgroundColor: colors.goldDim, borderWidth: 1, borderColor: colors.gold },
  icon: { fontSize: 22 },
  name: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.text, textAlign: 'center' },
  desc: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
});
