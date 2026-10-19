import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookCover } from '@/components/BookCover';
import { GoalRing } from '@/components/GoalRing';
import { Icon, type IconName } from '@/components/Icon';
import { Button, tap } from '@/components/ui';
import { getBook, type Book } from '@/data/books';
import { useI18n } from '@/i18n/I18nProvider';
import type { StringKey } from '@/i18n/strings';
import { colors, fonts, radius, shade, space, type } from '@/theme/tokens';

const pick = (ids: string[]) => ids.map(getBook).filter((b): b is Book => Boolean(b));

/** Little illustrations built from real app components, so the guide looks like the app. */
function ShelfArt() {
  const books = pick([
    'sombra-viento',
    'hail-mary',
    'circe',
    'reina-roja',
    'evelyn-hugo',
    'tres-cuerpos',
    'habitos-atomicos',
  ]);
  return (
    <View>
      <View style={styles.spines}>
        {books.map((b, i) => (
          <LinearGradient
            key={b.id}
            colors={[shade(b.color, -0.25), b.color, shade(b.color, -0.3)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.spine, { height: 120 + ((i * 37) % 4) * 12 }]}
          />
        ))}
      </View>
      <LinearGradient colors={[colors.woodEdge, colors.wood, colors.woodShadow]} style={styles.plank} />
    </View>
  );
}

function AddArt() {
  const items: IconName[] = ['search', 'barcode', 'camera'];
  return (
    <View style={styles.iconRow}>
      {items.map((icon, i) => (
        <View key={icon} style={[styles.iconBubble, i === 1 && styles.iconBubbleMain]}>
          <Icon name={icon} size={i === 1 ? 40 : 30} color={i === 1 ? colors.bg : colors.gold} strokeWidth={1.6} />
        </View>
      ))}
    </View>
  );
}

function DiscoverArt() {
  const books = pick(['cancion-aquiles', 'harry-quebert', 'piranesi']);
  return (
    <View style={styles.coversRow}>
      {books.map((b, i) => (
        <View key={b.id} style={{ transform: [{ rotate: `${(i - 1) * 7}deg` }, { translateY: i === 1 ? -12 : 0 }] }}>
          <BookCover book={b} width={i === 1 ? 96 : 82} />
        </View>
      ))}
      <View style={styles.sparkle}>
        <Icon name="sparkles" size={26} color={colors.bg} />
      </View>
    </View>
  );
}

function YearArt() {
  return (
    <View style={styles.yearRow}>
      <GoalRing done={13} goal={24} size={120} />
      <View style={{ gap: 10 }}>
        {['📖', '🧭', '🏃'].map((e) => (
          <View key={e} style={styles.medal}>
            <Text style={{ fontSize: 20 }}>{e}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const CARDS: { art: () => ReactNode; title: StringKey; body: StringKey }[] = [
  { art: ShelfArt, title: 'guide.1.title', body: 'guide.1.body' },
  { art: AddArt, title: 'guide.2.title', body: 'guide.2.body' },
  { art: DiscoverArt, title: 'guide.3.title', body: 'guide.3.body' },
  { art: YearArt, title: 'guide.4.title', body: 'guide.4.body' },
];

/** Four swipeable cards on how Leora works. Shown after onboarding and from the profile. */
export default function GuideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { first } = useLocalSearchParams<{ first?: string }>();
  const { t } = useI18n();
  const scroller = useRef<ScrollViewInstance>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const last = index === CARDS.length - 1;

  const done = () => {
    tap('success');
    if (first || !router.canGoBack()) router.replace('/');
    else router.back();
  };

  const goTo = (i: number) => {
    tap('select');
    setIndex(i);
    scroller.current?.scrollTo({ x: i * width, animated: true });
  };

  return (
    <View
      style={[styles.root, { paddingTop: insets.top + space.md, paddingBottom: Math.max(insets.bottom, space.lg) }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <LinearGradient
        colors={['rgba(201,164,106,0.16)', 'rgba(201,164,106,0)']}
        style={styles.glow}
        pointerEvents="none"
      />
      <Pressable onPress={done} style={styles.skip} hitSlop={10}>
        <Text style={styles.skipText}>{t('guide.skip')}</Text>
      </Pressable>

      {width > 0 && (
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          style={{ flex: 1 }}
        >
          {CARDS.map((card, i) => {
            const Art = card.art;
            return (
              <View key={card.title} style={[styles.page, { width }]}>
                <View style={styles.art}>
                  <Art />
                </View>
                <Text style={[type.label, { color: colors.gold, textAlign: 'center' }]}>
                  {i + 1} / {CARDS.length}
                </Text>
                <Text style={styles.title}>{t(card.title)}</Text>
                <Text style={[type.body, styles.body]}>{t(card.body)}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.dots}>
        {CARDS.map((c, i) => (
          <Pressable key={c.title} onPress={() => goTo(i)} hitSlop={6}>
            <View style={[styles.dot, i === index && styles.dotOn]} />
          </Pressable>
        ))}
      </View>

      <View style={{ paddingHorizontal: space.xl }}>
        <Button label={last ? t('guide.done') : t('guide.next')} onPress={() => (last ? done() : goTo(index + 1))} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },
  skip: { alignSelf: 'flex-end', paddingHorizontal: space.xl, paddingVertical: space.sm },
  skipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted },
  page: { paddingHorizontal: space.xl, justifyContent: 'center' },
  art: { height: 240, alignItems: 'center', justifyContent: 'center', marginBottom: space.xl },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: colors.text,
    textAlign: 'center',
    marginTop: space.md,
  },
  body: { color: colors.textMuted, textAlign: 'center', marginTop: space.md, paddingHorizontal: space.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: space.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surfaceHigh },
  dotOn: { width: 24, backgroundColor: colors.gold },
  spines: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, paddingHorizontal: 12 },
  spine: { width: 30, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  plank: { height: 12, borderRadius: 3, width: 260 },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  iconBubble: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  iconBubbleMain: { width: 108, height: 108, borderRadius: 54, backgroundColor: colors.gold, borderColor: colors.gold },
  coversRow: { flexDirection: 'row', alignItems: 'center', gap: -10 },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -14,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearRow: { flexDirection: 'row', alignItems: 'center', gap: space.xxl },
  medal: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldDim,
    borderWidth: 1,
    borderColor: colors.gold,
  },
});
