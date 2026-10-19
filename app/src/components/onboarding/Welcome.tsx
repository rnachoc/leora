import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookCover } from '../BookCover';
import { Button, tap } from '../ui';
import { getBook, type Book } from '@/data/books';
import { useI18n } from '@/i18n/I18nProvider';
import type { Locale } from '@/i18n/strings';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

const FAN = ['circe', 'sombra-viento', 'hail-mary', 'reina-roja', 'evelyn-hugo']
  .map(getBook)
  .filter((b): b is Book => Boolean(b));

/** First screen: a fan of covers, the promise, and two ways in. */
export function Welcome({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  const insets = useSafeAreaInsets();
  const { t, locale, setLocale } = useI18n();
  const [float] = useState(() => new Animated.Value(0));
  const [appear] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [appear, float]);

  const lift = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <View
      style={[styles.root, { paddingTop: insets.top + space.lg, paddingBottom: Math.max(insets.bottom, space.lg) }]}
    >
      <LinearGradient
        colors={['rgba(201,164,106,0.22)', 'rgba(201,164,106,0)']}
        style={styles.glow}
        pointerEvents="none"
      />

      <View style={styles.langs}>
        {(['es', 'en'] as Locale[]).map((l) => (
          <Pressable
            key={l}
            onPress={() => {
              tap('select');
              setLocale(l);
            }}
            style={[styles.lang, locale === l && styles.langOn]}
          >
            <Text style={[styles.langText, locale === l && { color: colors.bg }]}>{l.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Animated.View style={[styles.fan, { opacity: appear, transform: [{ translateY: lift }] }]}>
        {FAN.map((book, i) => {
          const offset = i - (FAN.length - 1) / 2;
          return (
            <View
              key={book.id}
              style={[
                styles.fanItem,
                {
                  zIndex: 10 - Math.abs(offset),
                  transform: [
                    { translateX: offset * 52 },
                    { translateY: Math.abs(offset) * 14 },
                    { rotate: `${offset * 8}deg` },
                  ],
                },
              ]}
            >
              <BookCover book={book} width={offset === 0 ? 124 : 108} />
            </View>
          );
        })}
      </Animated.View>

      <Animated.View style={[styles.copy, { opacity: appear }]}>
        <Text style={[type.label, { color: colors.gold, textAlign: 'center' }]}>{t('onb.welcome.kicker')}</Text>
        <Text style={styles.title}>{t('onb.welcome.title')}</Text>
        <Text style={[type.body, styles.sub]}>{t('onb.welcome.sub')}</Text>
      </Animated.View>

      <View style={styles.actions}>
        <Button label={t('onb.welcome.start')} onPress={onStart} />
        <Pressable onPress={onDemo} style={styles.demo}>
          <Text style={styles.demoText}>{t('onb.welcome.demo')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.xl, justifyContent: 'space-between' },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 460 },
  langs: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    gap: 4,
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  lang: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  langOn: { backgroundColor: colors.gold },
  langText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  fan: { height: 230, alignItems: 'center', justifyContent: 'center', marginTop: space.lg },
  fanItem: { position: 'absolute' },
  copy: { gap: space.md },
  title: { fontFamily: fonts.display, fontSize: 36, lineHeight: 42, color: colors.text, textAlign: 'center' },
  sub: { color: colors.textMuted, textAlign: 'center' },
  actions: { gap: space.sm },
  demo: { paddingVertical: space.md, alignItems: 'center' },
  demoText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
