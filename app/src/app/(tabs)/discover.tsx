import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BookCover } from '@/components/BookCover';
import { Icon } from '@/components/Icon';
import { RecommendationCard } from '@/components/RecommendationCard';
import { ThinkingOrb } from '@/components/ThinkingOrb';
import { Button, Screen, Segmented, tap } from '@/components/ui';
import { FREE_RECOMMENDATIONS_PER_MONTH } from '@/data/library';
import { GENRES, MOODS, type GenreId, type MoodId } from '@/data/taxonomy';
import { useI18n } from '@/i18n/I18nProvider';
import { recommend, type Recommendation, type RecommendRequest } from '@/lib/recommend';
import { useLibrary } from '@/store/LibraryProvider';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

type Mode = RecommendRequest['mode'];
type Phase = 'pick' | 'thinking' | 'results';

export default function DiscoverScreen() {
  const router = useRouter();
  const { seed } = useLocalSearchParams<{ seed?: string }>();
  const { t, locale } = useI18n();
  const { items, entries, dismissed, profile, recommendationsLeft, canRecommend, dispatch } = useLibrary();

  const [mode, setMode] = useState<Mode>('genre');
  const [genre, setGenre] = useState<GenreId>();
  const [mood, setMood] = useState<MoodId>();
  const [likeId, setLikeId] = useState<string>();
  const [phase, setPhase] = useState<Phase>('pick');
  const [results, setResults] = useState<Recommendation[]>([]);

  // Arriving from a book's "recommend something similar" button.
  useEffect(() => {
    if (seed) {
      setMode('like');
      setLikeId(seed);
      setPhase('pick');
    }
  }, [seed]);

  const favourites = items.filter((i) => i.entry.status === 'read' && (i.entry.rating ?? 0) >= 4);
  const readCount = items.filter((i) => i.entry.status === 'read').length;

  const request: RecommendRequest | undefined =
    mode === 'genre' && genre
      ? { mode, genre }
      : mode === 'mood' && mood
        ? { mode, mood }
        : mode === 'like' && likeId
          ? { mode, bookId: likeId }
          : undefined;

  const run = () => {
    if (!request) return;
    if (!canRecommend) {
      router.push({ pathname: '/premium', params: { reason: 'limit' } });
      return;
    }
    dispatch({ type: 'useRecommendation' });
    setPhase('thinking');
    const picks = recommend(request, {
      entries,
      dismissed,
      locale,
      t,
      preferences: { genres: profile.favoriteGenres, moods: profile.favoriteMoods },
    });
    setTimeout(() => {
      tap('success');
      setResults(picks);
      setPhase('results');
    }, 2900);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={type.hero}>{t('discover.title')}</Text>
        <Text style={[type.small, { marginTop: 8 }]}>{t('discover.subtitle', { count: readCount })}</Text>
        <Pressable
          onPress={() => !profile.isPremium && router.push('/premium')}
          style={styles.quota}
        >
          <Icon name={profile.isPremium ? 'crown' : 'sparkles'} size={14} color={colors.gold} />
          <Text style={styles.quotaText}>
            {profile.isPremium
              ? t('discover.unlimited')
              : t('discover.quota', { left: recommendationsLeft, total: FREE_RECOMMENDATIONS_PER_MONTH })}
          </Text>
        </Pressable>
      </View>

      {phase === 'thinking' && (
        <ThinkingOrb messages={[t('discover.thinking.1'), t('discover.thinking.2'), t('discover.thinking.3')]} />
      )}

      {phase === 'results' && (
        <View style={styles.section}>
          <Text style={[type.label, { marginBottom: space.md }]}>{t('discover.results')}</Text>
          <View style={{ gap: space.lg }}>
            {results.map((r, i) => (
              <RecommendationCard key={r.book.id} rec={r} index={i} />
            ))}
          </View>
          <Button
            label={t('discover.again')}
            icon="compass"
            variant="secondary"
            style={{ marginTop: space.xl }}
            onPress={() => setPhase('pick')}
          />
        </View>
      )}

      {phase === 'pick' && (
        <View style={styles.section}>
          <Segmented<Mode>
            value={mode}
            onChange={setMode}
            options={[
              { value: 'genre', label: t('discover.mode.genre') },
              { value: 'mood', label: t('discover.mode.mood') },
              { value: 'like', label: t('discover.mode.like') },
            ]}
          />

          <View style={{ marginTop: space.xl }}>
            {mode === 'genre' && (
              <View style={styles.genreGrid}>
                {GENRES.map((g) => {
                  const active = genre === g.id;
                  return (
                    <Pressable
                      key={g.id}
                      onPress={() => {
                        tap('select');
                        setGenre(g.id);
                      }}
                      style={({ pressed }) => [styles.genre, active && styles.active, pressed && styles.pressed]}
                    >
                      <Text style={styles.emoji}>{g.emoji}</Text>
                      <Text style={[styles.genreLabel, active && { color: colors.bg }]}>{g.label[locale]}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {mode === 'mood' && (
              <View style={{ gap: space.sm }}>
                {MOODS.map((m) => {
                  const active = mood === m.id;
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => {
                        tap('select');
                        setMood(m.id);
                      }}
                      style={({ pressed }) => [styles.mood, active && styles.active, pressed && styles.pressed]}
                    >
                      <Text style={styles.moodEmoji}>{m.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.moodLabel, active && { color: colors.bg }]}>{m.label[locale]}</Text>
                        <Text style={[type.small, active && { color: 'rgba(14,12,10,0.7)' }]}>{m.hint[locale]}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {mode === 'like' && (
              <View>
                <Text style={[type.small, { marginBottom: space.md }]}>{t('discover.pickLike')}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -space.xl }}
                  contentContainerStyle={{ gap: space.md, paddingHorizontal: space.xl }}
                >
                  {favourites.map(({ book }) => {
                    const active = likeId === book.id;
                    return (
                      <Pressable
                        key={book.id}
                        onPress={() => {
                          tap('select');
                          setLikeId(book.id);
                        }}
                        style={[styles.likeItem, active && styles.likeActive]}
                      >
                        <BookCover book={book} width={92} shadow={false} />
                        {active && (
                          <View style={styles.likeCheck}>
                            <Icon name="check" size={14} color={colors.bg} strokeWidth={2.4} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          <Button
            label={t('discover.cta')}
            icon="sparkles"
            disabled={!request}
            style={{ marginTop: space.xxl }}
            onPress={run}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.xl, marginBottom: space.xl },
  quota: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    marginTop: space.lg,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.goldDim,
  },
  quotaText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.goldBright },
  section: { paddingHorizontal: space.xl },
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  genre: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: { backgroundColor: colors.gold, borderColor: colors.gold },
  pressed: { transform: [{ scale: 0.97 }] },
  emoji: { fontSize: 20 },
  genreLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, flexShrink: 1 },
  mood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, marginBottom: 2 },
  likeItem: { borderRadius: 8, padding: 3, borderWidth: 2, borderColor: 'transparent' },
  likeActive: { borderColor: colors.gold },
  likeCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
