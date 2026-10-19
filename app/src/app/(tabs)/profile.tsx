import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { BadgeGrid } from '@/components/BadgeGrid';
import { GoalRing } from '@/components/GoalRing';
import { Icon } from '@/components/Icon';
import { Button, Card, Screen, SectionTitle, Segmented, tap } from '@/components/ui';
import { genreLabel } from '@/data/taxonomy';
import { useI18n } from '@/i18n/I18nProvider';
import type { Locale } from '@/i18n/strings';
import { goalPace, readingStats } from '@/lib/stats';
import { useLibrary } from '@/store/LibraryProvider';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

export default function ProfileScreen() {
  const router = useRouter();
  const { t, locale, setLocale, formatNumber } = useI18n();
  const { items, profile } = useLibrary();
  const [copied, setCopied] = useState(false);

  const stats = readingStats(items);
  const pace = goalPace(stats.readThisYear, profile.yearlyGoal);
  const publicUrl = `leora.app/@${profile.username}`;
  const maxGenre = stats.topGenres[0]?.[1] ?? 1;

  const share = async () => {
    tap();
    const url = `https://${publicUrl}`;
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard?.writeText(url);
      } catch {}
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      return;
    }
    Share.share({ message: url, url });
  };

  return (
    <Screen>
      {/* Identity */}
      <View style={styles.identity}>
        <LinearGradient colors={[colors.goldBright, '#8A6A3A']} style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.name[0]}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={type.title}>{profile.name}</Text>
          <Text style={type.small}>@{profile.username}</Text>
        </View>
        <Pressable
          onPress={() => !profile.isPremium && router.push('/premium')}
          style={[styles.premiumPill, profile.isPremium && styles.premiumPillOn]}
        >
          <Icon name="crown" size={14} color={profile.isPremium ? colors.bg : colors.gold} />
          <Text style={[styles.premiumPillText, profile.isPremium && { color: colors.bg }]}>
            {profile.isPremium ? 'Premium' : t('profile.premiumCta')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {/* Public library link */}
        <Card style={styles.linkCard}>
          <Icon name="globe" size={20} color={colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={type.label}>{t('profile.publicLink')}</Text>
            <Text style={styles.link}>{publicUrl}</Text>
          </View>
          <Button size="sm" variant="secondary" icon={copied ? 'check' : 'share'} label={copied ? t('profile.copied') : t('profile.share')} onPress={share} />
        </Card>

        {/* Yearly goal */}
        <Card style={styles.goal}>
          <GoalRing done={stats.readThisYear} goal={profile.yearlyGoal} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={type.label}>{t('profile.goal', { year: stats.year })}</Text>
            <Text style={type.heading}>{t('profile.goalOf', { done: stats.readThisYear, goal: profile.yearlyGoal })}</Text>
            <Text style={[type.small, { color: pace.diff >= 0 ? colors.success : colors.textMuted }]}>
              {pace.diff >= 0
                ? t('profile.goalAhead', { count: pace.diff })
                : t('profile.goalBehind', { count: -pace.diff })}
            </Text>
          </View>
        </Card>

        {/* Wrapped */}
        <Pressable
          onPress={() => {
            tap();
            router.push('/wrapped');
          }}
          style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}
        >
          <LinearGradient
            colors={['#3B1F4A', '#7A2E35', '#C9A46A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wrapped}
          >
            <Text style={[type.label, { color: 'rgba(255,255,255,0.75)' }]}>{stats.year}</Text>
            <Text style={[type.title, { color: '#fff' }]}>{t('profile.wrapped')}</Text>
            <View style={styles.wrappedCta}>
              <Text style={styles.wrappedCtaText}>{t('profile.wrappedCta')}</Text>
              <Icon name="chevronRight" size={16} color="#fff" />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Numbers */}
        <View>
          <SectionTitle>{t('profile.stats')}</SectionTitle>
          <View style={styles.statsRow}>
            {[
              { label: t('profile.stat.books'), value: String(stats.readCount) },
              { label: t('profile.stat.pages'), value: formatNumber(stats.pages) },
              { label: t('profile.stat.avg'), value: `${stats.avgRating.toFixed(1)}★` },
            ].map((s) => (
              <Card key={s.label} style={styles.stat}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={type.small}>{s.label}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Genres */}
        <Card>
          <SectionTitle>{t('profile.topGenres')}</SectionTitle>
          <View style={{ gap: space.md }}>
            {stats.topGenres.map(([g, n]) => (
              <View key={g} style={styles.genreRow}>
                <Text style={styles.genreName}>{genreLabel(g, locale)}</Text>
                <View style={styles.genreTrack}>
                  <LinearGradient
                    colors={[colors.gold, colors.goldBright]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.genreBar, { width: `${(n / maxGenre) * 100}%` }]}
                  />
                </View>
                <Text style={styles.genreCount}>{n}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Badges */}
        <View>
          <SectionTitle>{t('profile.badges')}</SectionTitle>
          <BadgeGrid badges={stats.badges} />
        </View>

        {/* Settings */}
        <Card style={{ gap: space.md }}>
          <SectionTitle>{t('profile.language')}</SectionTitle>
          <Segmented<Locale>
            value={locale}
            onChange={setLocale}
            options={[
              { value: 'es', label: 'Español' },
              { value: 'en', label: 'English' },
            ]}
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingHorizontal: space.xl,
    marginBottom: space.xl,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.display, fontSize: 28, color: colors.bg },
  premiumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  premiumPillOn: { backgroundColor: colors.gold },
  premiumPillText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.gold },
  body: { paddingHorizontal: space.xl, gap: space.xl },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  link: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, marginTop: 2 },
  goal: { flexDirection: 'row', alignItems: 'center', gap: space.xl },
  wrapped: { borderRadius: radius.lg, padding: space.xl, gap: 6 },
  wrappedCta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: space.sm },
  wrappedCtaText: { fontFamily: fonts.semibold, fontSize: 14, color: '#fff' },
  statsRow: { flexDirection: 'row', gap: space.sm },
  stat: { flex: 1, alignItems: 'center', paddingVertical: space.lg, paddingHorizontal: space.sm },
  statValue: { fontFamily: fonts.display, fontSize: 24, color: colors.text, marginBottom: 2 },
  genreRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  genreName: { width: 110, fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  genreTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  genreBar: { height: '100%', borderRadius: 4 },
  genreCount: { width: 20, textAlign: 'right', fontFamily: fonts.semibold, fontSize: 13, color: colors.textMuted },
});
