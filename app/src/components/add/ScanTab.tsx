import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../Icon';
import { Button } from '../ui';
import { AddBookRow } from './AddBookRow';
import { CATALOG, type Book } from '@/data/books';
import { useI18n } from '@/i18n/I18nProvider';
import { useLibrary } from '@/store/LibraryProvider';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

const FRAME = 240;

/**
 * Barcode scanner. The prototype simulates the camera; production uses
 * expo-camera's barcode scanning (EAN-13 / ISBN) and looks the ISBN up.
 */
export function ScanTab() {
  const { t } = useI18n();
  const { entryFor } = useLibrary();
  const [found, setFound] = useState<Book>();
  const line = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(line, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(line, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [line]);

  const simulate = () => {
    const pool = CATALOG.filter((b) => !entryFor(b.id));
    setFound(pool[Math.floor(Math.random() * pool.length)]);
  };

  const translateY = line.interpolate({ inputRange: [0, 1], outputRange: [12, FRAME - 14] });

  return (
    <View style={{ gap: space.xl, alignItems: 'center' }}>
      <View style={styles.viewfinder}>
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <View key={c} style={[styles.corner, styles[c]]} />
        ))}
        <Icon name="barcode" size={72} color="rgba(243,235,221,0.18)" strokeWidth={1.2} />
        <Animated.View style={[styles.laser, { transform: [{ translateY }] }]} />
      </View>

      <Text style={[type.small, { textAlign: 'center' }]}>{t('add.scanHint')}</Text>

      {found ? (
        <View style={{ alignSelf: 'stretch', gap: space.sm }}>
          <Text style={[type.label, { color: colors.gold }]}>{t('add.scanFound')}</Text>
          <AddBookRow key={found.id} book={found} initiallyOpen />
        </View>
      ) : null}

      <Button label={t('add.scanSimulate')} icon="barcode" variant={found ? 'secondary' : 'primary'} onPress={simulate} />
      <Text style={styles.proto}>{t('add.prototype')}</Text>
    </View>
  );
}

const C = 28;
const styles = StyleSheet.create({
  viewfinder: {
    width: FRAME,
    height: FRAME,
    borderRadius: radius.lg,
    backgroundColor: '#0A0907',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  corner: { position: 'absolute', width: C, height: C, borderColor: colors.gold },
  tl: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
  tr: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
  bl: { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
  br: { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },
  laser: {
    position: 'absolute',
    top: 0,
    left: 22,
    right: 22,
    height: 2,
    backgroundColor: colors.goldBright,
    shadowColor: colors.gold,
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  proto: { fontFamily: fonts.medium, fontSize: 11, color: colors.textFaint },
});
