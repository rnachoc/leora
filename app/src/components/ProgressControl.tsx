import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { tap } from './ui';
import { colors, fonts, radius, space } from '@/theme/tokens';

type Props = {
  /** 0–1 */
  value: number;
  /** Total pages, when known: the control then works in pages. */
  pages?: number;
  label: (value: number) => string;
  onChange: (value: number) => void;
};

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Reading progress: drag or tap the track, or nudge with −/+ (10 pages, or 5%
 * when the page count is unknown). Commits on release to avoid a save per pixel.
 */
export function ProgressControl({ value, pages, label, onChange }: Props) {
  const [draft, setDraft] = useState<number>();
  const width = useRef(0);
  const shown = draft ?? value;
  const step = pages ? 10 / pages : 0.05;

  const commit = (v: number) => {
    const rounded = pages ? Math.round(v * pages) / pages : Math.round(v * 100) / 100;
    setDraft(undefined);
    onChange(clamp(rounded));
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => setDraft(clamp(e.nativeEvent.locationX / (width.current || 1))),
      onPanResponderMove: (e) => setDraft(clamp(e.nativeEvent.locationX / (width.current || 1))),
      onPanResponderRelease: (e) => {
        tap('select');
        commit(clamp(e.nativeEvent.locationX / (width.current || 1)));
      },
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.row}>
        <Pressable
          accessibilityLabel="−"
          onPress={() => {
            tap('select');
            commit(shown - step);
          }}
          style={styles.btn}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>

        <View
          style={styles.hit}
          onLayout={(e) => (width.current = e.nativeEvent.layout.width)}
          accessibilityRole="adjustable"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(shown * 100) }}
          {...pan.panHandlers}
        >
          <View style={styles.track} pointerEvents="none">
            <LinearGradient
              colors={[colors.gold, colors.goldBright]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.fill, { width: `${shown * 100}%` }]}
            />
          </View>
          <View pointerEvents="none" style={[styles.thumb, { left: `${shown * 100}%` }]} />
        </View>

        <Pressable
          accessibilityLabel="+"
          onPress={() => {
            tap('select');
            commit(shown + step);
          }}
          style={styles.btn}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
      <Text style={styles.label}>{label(shown)}</Text>
    </View>
  );
}

const THUMB = 22;
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  btnText: { fontFamily: fonts.medium, fontSize: 22, lineHeight: 24, color: colors.text },
  hit: { flex: 1, height: 36, justifyContent: 'center' },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    marginLeft: -THUMB / 2,
    borderRadius: THUMB / 2,
    backgroundColor: colors.goldBright,
    borderWidth: 3,
    borderColor: colors.bg,
  },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
