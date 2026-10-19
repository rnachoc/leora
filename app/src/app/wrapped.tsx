import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookCover } from '@/components/BookCover';
import { Stars } from '@/components/Stars';
import { Button, IconButton, tap } from '@/components/ui';
import { GENRES } from '@/data/taxonomy';
import { useI18n } from '@/i18n/I18nProvider';
import { readingStats } from '@/lib/stats';
import { useLibrary } from '@/store/LibraryProvider';
import { fonts, space } from '@/theme/tokens';

const BACKGROUNDS: [string, string, string][] = [
  ['#1B1030', '#3B1F4A', '#7A2E35'],
  ['#0F2A2A', '#1F5C4F', '#C9A46A'],
  ['#2A0F14', '#7A2E35', '#D98473'],
  ['#14120E', '#3A2C1F', '#C9A46A'],
  ['#1A1033', '#4B2A7A', '#E3C38C'],
];

/** Instagram-stories style year-in-review: tap right to advance, left to go back. */
export default function WrappedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, locale, formatNumber } = useI18n();
  const { items } = useLibrary();
  const stats = readingStats(items);
  const [slide, setSlide] = useState(0);
  const [fade] = useState(() => new Animated.Value(0));

  const total = BACKGROUNDS.length;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [slide, fade]);

  const go = (dir: 1 | -1) => {
    tap('select');
    setSlide((s) => Math.max(0, Math.min(total - 1, s + dir)));
  };

  const topGenre = GENRES.find((g) => g.id === stats.topGenres[0]?.[0]);
  const persona = stats.persona;

  const share = () => {
    const msg = `${t('wrapped.intro', { year: stats.year })}: ${stats.readThisYear} ${t('wrapped.booksUnit')} · ${t(`persona.${persona}`)} 📚 leora.app`;
    if (Platform.OS === 'web') navigator.clipboard?.writeText(msg).catch(() => {});
    else Share.share({ message: msg });
  };

  const content = [
    <View key="intro" style={styles.center}>
      <Text style={styles.kicker}>LEORA</Text>
      <Text style={styles.huge}>{t('wrapped.intro', { year: stats.year })}</Text>
      <Text style={styles.sub}>{t('wrapped.introSub')}</Text>
    </View>,
    <View key="books" style={styles.center}>
      <Text style={styles.kicker}>{t('wrapped.books')}</Text>
      <Text style={styles.number}>{stats.readThisYear}</Text>
      <Text style={styles.big}>{t('wrapped.booksUnit')}</Text>
      <Text style={[styles.sub, { marginTop: space.xl }]}>
        {stats.readThisYear
          ? t('wrapped.pages', { pages: formatNumber(stats.pagesThisYear), hours: stats.hoursThisYear })
          : t('wrapped.empty')}
      </Text>
    </View>,
    <View key="genre" style={styles.center}>
      <Text style={styles.kicker}>{t('wrapped.genre')}</Text>
      {topGenre ? (
        <>
          <Text style={{ fontSize: 96, marginVertical: space.lg }}>{topGenre.emoji}</Text>
          <Text style={styles.huge}>{topGenre.label[locale]}</Text>
        </>
      ) : (
        <Text style={[styles.sub, styles.empty]}>{t('wrapped.empty')}</Text>
      )}
    </View>,
    <View key="fav" style={styles.center}>
      <Text style={styles.kicker}>{t('wrapped.favorite')}</Text>
      {!stats.favourite && <Text style={[styles.sub, styles.empty]}>{t('wrapped.empty')}</Text>}
      {stats.favourite && (
        <>
          <BookCover book={stats.favourite.book} width={180} style={{ marginVertical: space.xl }} />
          <Text style={styles.big}>{stats.favourite.book.title}</Text>
          <Text style={styles.sub}>{stats.favourite.book.author}</Text>
          <View style={{ marginTop: space.md }}>
            <Stars value={stats.favourite.entry.rating} size={22} gap={4} />
          </View>
        </>
      )}
    </View>,
    <View key="persona" style={styles.center}>
      <Text style={styles.kicker}>{t('wrapped.persona')}</Text>
      <Text style={styles.huge}>{t(`persona.${persona}`)}</Text>
      <Text style={[styles.sub, { marginTop: space.lg, maxWidth: 280 }]}>{t(`persona.${persona}.desc`)}</Text>
      <Button label={t('wrapped.share')} icon="share" style={{ marginTop: space.xxl }} onPress={share} />
    </View>,
  ];

  return (
    <LinearGradient colors={BACKGROUNDS[slide]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      {/* Progress bars */}
      <View style={[styles.bars, { top: insets.top + 10 }]}>
        {BACKGROUNDS.map((_, i) => (
          <View key={i} style={styles.bar}>
            <View style={[styles.barFill, { width: i <= slide ? '100%' : '0%' }]} />
          </View>
        ))}
      </View>
      <IconButton
        icon="x"
        label={t('common.close')}
        onPress={close}
        style={[styles.close, { top: insets.top + 26 }]}
      />

      <Animated.View
        style={[
          styles.slide,
          { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
        ]}
      >
        {content[slide]}
      </Animated.View>

      {/* Tap zones */}
      <View style={[StyleSheet.absoluteFill, styles.zones]} pointerEvents="box-none">
        <Pressable style={{ flex: 1 }} onPress={() => go(-1)} accessibilityLabel={t('common.back')} />
        <Pressable
          style={{ flex: 2 }}
          onPress={() => (slide === total - 1 ? undefined : go(1))}
          accessibilityLabel={t('wrapped.tapHint')}
          pointerEvents={slide === total - 1 ? 'none' : 'auto'}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bars: { position: 'absolute', left: space.lg, right: space.lg, flexDirection: 'row', gap: 4, zIndex: 5 },
  bar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#fff' },
  close: {
    position: 'absolute',
    right: space.lg,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  slide: { flex: 1, justifyContent: 'center', paddingHorizontal: space.xl },
  zones: { flexDirection: 'row', top: 90 },
  center: { alignItems: 'center' },
  kicker: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  huge: { fontFamily: fonts.display, fontSize: 44, lineHeight: 50, color: '#fff', textAlign: 'center', marginTop: 12 },
  number: { fontFamily: fonts.display, fontSize: 140, lineHeight: 150, color: '#fff' },
  big: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, color: '#fff', textAlign: 'center' },
  empty: { marginTop: space.xl, maxWidth: 280 },
  sub: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
});
