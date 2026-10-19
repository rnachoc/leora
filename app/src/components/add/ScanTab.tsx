import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '../Icon';
import { Button, tap } from '../ui';
import { AddBookRow } from './AddBookRow';
import { registerBooks, type Book } from '@/data/books';
import { useI18n } from '@/i18n/I18nProvider';
import { lookupIsbn, toIsbn13 } from '@/lib/catalog';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

const FRAME = 260;
/** "La sombra del viento", Planeta — handy for trying the flow on a computer. */
const SAMPLE_ISBN = '9788408163350';

type Phase =
  | { kind: 'scanning' }
  | { kind: 'looking'; isbn: string }
  | { kind: 'found'; book: Book }
  | { kind: 'notFound'; isbn: string }
  | { kind: 'error' };

/**
 * Real barcode scanner (expo-camera, works in Expo Go and on the web):
 * reads EAN-13 / ISBN barcodes, validates them and looks the edition up.
 * A typed ISBN works too, for devices without a camera.
 */
export function ScanTab() {
  const { t } = useI18n();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>({ kind: 'scanning' });
  const [hint, setHint] = useState<string>();
  const [cameraFailed, setCameraFailed] = useState(false);
  const [manual, setManual] = useState('');
  const busy = useRef(false);
  const lastRejected = useRef<string | undefined>(undefined);
  const [line] = useState(() => new Animated.Value(0));

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

  const lookup = async (isbn: string) => {
    busy.current = true;
    setHint(undefined);
    setPhase({ kind: 'looking', isbn });
    try {
      const book = await lookupIsbn(isbn);
      if (book) {
        registerBooks([book]);
        tap('success');
        setPhase({ kind: 'found', book });
      } else {
        setPhase({ kind: 'notFound', isbn });
      }
    } catch {
      setPhase({ kind: 'error' });
    }
  };

  const onScanned = ({ data }: BarcodeScanningResult) => {
    if (busy.current) return;
    const isbn = toIsbn13(data);
    if (!isbn) {
      // Ignore the same non-book code firing repeatedly, but tell the reader once.
      if (lastRejected.current !== data) {
        lastRejected.current = data;
        setHint(t('add.scan.notBook'));
      }
      return;
    }
    lookup(isbn);
  };

  const submitManual = (value = manual) => {
    const isbn = toIsbn13(value);
    if (!isbn) {
      setHint(t('add.scan.notBook'));
      return;
    }
    lookup(isbn);
  };

  const restart = () => {
    busy.current = false;
    lastRejected.current = undefined;
    setHint(undefined);
    setManual('');
    setPhase({ kind: 'scanning' });
  };

  const translateY = line.interpolate({ inputRange: [0, 1], outputRange: [16, FRAME - 18] });
  const granted = permission?.granted && !cameraFailed;

  return (
    <View style={{ gap: space.xl }}>
      {phase.kind === 'found' ? (
        <View style={{ gap: space.sm }}>
          <Text style={[type.label, { color: colors.gold }]}>
            {t('add.scanFound')} · {phase.book.isbn}
          </Text>
          <AddBookRow key={phase.book.id} book={phase.book} initiallyOpen />
          <Button label={t('add.scan.again')} icon="barcode" variant="secondary" onPress={restart} />
        </View>
      ) : (
        <View style={styles.viewfinder}>
          {granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a'] }}
              onBarcodeScanned={phase.kind === 'scanning' ? onScanned : undefined}
              onMountError={() => setCameraFailed(true)}
            />
          ) : (
            <View style={styles.placeholder}>
              <Icon name="barcode" size={64} color="rgba(243,235,221,0.18)" strokeWidth={1.2} />
            </View>
          )}
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
            <View key={c} style={[styles.corner, styles[c]]} />
          ))}
          {granted && phase.kind === 'scanning' && (
            <Animated.View style={[styles.laser, { transform: [{ translateY }] }]} />
          )}
          {phase.kind === 'looking' && (
            <View style={styles.overlay}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.overlayText}>{t('add.scan.looking')}</Text>
            </View>
          )}
        </View>
      )}

      {phase.kind === 'scanning' && !granted && (
        <View style={{ gap: space.md, alignItems: 'center' }}>
          {cameraFailed ? (
            <Text style={[type.small, styles.center]}>{t('add.scan.noCamera')}</Text>
          ) : permission && !permission.granted && !permission.canAskAgain ? (
            <Text style={[type.small, styles.center]}>{t('add.scan.denied')}</Text>
          ) : (
            <>
              <Text style={[type.heading, styles.center]}>{t('add.scan.permissionTitle')}</Text>
              <Text style={[type.small, styles.center]}>{t('add.scan.permissionBody')}</Text>
              <Button label={t('add.scan.allow')} icon="camera" onPress={() => requestPermission()} />
            </>
          )}
        </View>
      )}

      {phase.kind === 'scanning' && granted && <Text style={[type.small, styles.center]}>{t('add.scanHint')}</Text>}

      {hint && phase.kind === 'scanning' && <Text style={[styles.hint, styles.center]}>{hint}</Text>}

      {(phase.kind === 'notFound' || phase.kind === 'error') && (
        <View style={{ gap: space.md }}>
          <Text style={[styles.hint, styles.center]}>
            {phase.kind === 'notFound' ? t('add.scan.notFound', { isbn: phase.isbn }) : t('add.scan.error')}
          </Text>
          <Button label={t('add.scan.again')} icon="barcode" variant="secondary" onPress={restart} />
        </View>
      )}

      {phase.kind === 'scanning' && (
        <View style={{ gap: space.sm }}>
          <Text style={type.label}>{t('add.scan.manual')}</Text>
          <View style={styles.manualRow}>
            <TextInput
              value={manual}
              onChangeText={setManual}
              placeholder={t('add.scan.manualPlaceholder')}
              placeholderTextColor={colors.textFaint}
              keyboardType="number-pad"
              returnKeyType="search"
              onSubmitEditing={() => submitManual()}
              style={styles.manualInput}
            />
            <Button
              size="sm"
              label={t('add.scan.search')}
              disabled={manual.length < 10}
              onPress={() => submitManual()}
            />
          </View>
          <Pressable
            onPress={() => {
              setManual(SAMPLE_ISBN);
              submitManual(SAMPLE_ISBN);
            }}
            style={{ alignSelf: 'center', paddingVertical: space.sm }}
          >
            <Text style={styles.example}>{t('add.scan.example')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const C = 30;
const styles = StyleSheet.create({
  viewfinder: {
    width: FRAME,
    height: FRAME,
    alignSelf: 'center',
    borderRadius: radius.lg,
    backgroundColor: '#0A0907',
    overflow: 'hidden',
  },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: C, height: C, borderColor: colors.gold },
  tl: { top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
  tr: { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
  bl: { bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
  br: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },
  laser: {
    position: 'absolute',
    top: 0,
    left: 26,
    right: 26,
    height: 2,
    backgroundColor: colors.goldBright,
    shadowColor: colors.gold,
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    backgroundColor: colors.overlay,
  },
  overlayText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  center: { textAlign: 'center' },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: colors.goldBright },
  manualRow: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  manualInput: {
    flex: 1,
    minWidth: 0,
    height: 46,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    fontFamily: fonts.medium,
    fontSize: 16,
    letterSpacing: 1,
    color: colors.text,
  },
  example: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
});
