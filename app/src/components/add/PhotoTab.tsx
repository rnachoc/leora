import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { hashOf, inkFor } from '../BookCover';
import { Icon } from '../Icon';
import { Button, tap } from '../ui';
import { CATALOG, type Book } from '@/data/books';
import { useI18n } from '@/i18n/I18nProvider';
import { useLibrary } from '@/store/LibraryProvider';
import { colors, fonts, radius, shade, space, type } from '@/theme/tokens';

type Phase = 'idle' | 'analyzing' | 'review';

/**
 * Shelf-photo recognition. Production: a vision model extracts (title, author)
 * from the spines, each is matched against the catalog and the reader confirms.
 * The prototype simulates the photo with a generated shelf.
 */
export function PhotoTab() {
  const { t } = useI18n();
  const { entryFor, dispatch } = useLibrary();
  const [phase, setPhase] = useState<Phase>('idle');
  const [books, setBooks] = useState<Book[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase !== 'analyzing') return;
    sweep.setValue(0);
    const anim = Animated.loop(
      Animated.timing(sweep, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    );
    anim.start();
    const done = setTimeout(() => {
      tap('success');
      setPhase('review');
    }, 2600);
    return () => {
      anim.stop();
      clearTimeout(done);
    };
  }, [phase, sweep]);

  const takePhoto = () => {
    const shuffled = [...CATALOG].sort((a, b) => hashOf(a.id + Date.now()) - hashOf(b.id + Date.now()));
    const picks = shuffled.slice(0, 7);
    setBooks(picks);
    setSelected(new Set(picks.filter((b) => !entryFor(b.id)).map((b) => b.id)));
    setPhase('analyzing');
  };

  const toggle = (id: string) => {
    tap('select');
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirm = () => {
    selected.forEach((id) => dispatch({ type: 'add', bookId: id, status: 'read' }));
    tap('success');
    setPhase('idle');
    setBooks([]);
  };

  const translateX = sweep.interpolate({ inputRange: [0, 1], outputRange: [-60, 320] });

  return (
    <View style={{ gap: space.xl }}>
      <View style={styles.photo}>
        {phase === 'idle' ? (
          <View style={styles.placeholder}>
            <Icon name="camera" size={44} color={colors.textFaint} strokeWidth={1.3} />
            <Text style={[type.small, { textAlign: 'center', maxWidth: 220 }]}>{t('add.photoHint')}</Text>
          </View>
        ) : (
          <>
            <View style={styles.spines}>
              {books.map((b, i) => {
                const h = 120 + (hashOf(b.id) % 4) * 12;
                const detected = phase === 'review';
                return (
                  <LinearGradient
                    key={b.id}
                    colors={[shade(b.color, -0.2), b.color, shade(b.color, -0.35)]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.spine,
                      { height: h, transform: [{ rotate: i === 3 ? '-4deg' : '0deg' }] },
                      detected && selected.has(b.id) && styles.spineDetected,
                    ]}
                  >
                    <View
                      style={{
                        position: 'absolute',
                        width: h - 16,
                        height: 30,
                        left: (30 - (h - 16)) / 2,
                        top: (h - 30) / 2,
                        transform: [{ rotate: '-90deg' }],
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text numberOfLines={1} style={[styles.spineText, { color: inkFor(b.color) }]}>
                        {b.title}
                      </Text>
                    </View>
                  </LinearGradient>
                );
              })}
            </View>
            <LinearGradient colors={[colors.woodEdge, colors.wood]} style={styles.plank} />
            {phase === 'analyzing' && (
              <Animated.View style={[styles.sweep, { transform: [{ translateX }] }]}>
                <LinearGradient
                  colors={['rgba(227,195,140,0)', 'rgba(227,195,140,0.45)', 'rgba(227,195,140,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            )}
          </>
        )}
      </View>

      {phase === 'idle' && <Button label={t('add.photoTake')} icon="camera" onPress={takePhoto} />}

      {phase === 'analyzing' && (
        <Text style={[type.heading, { textAlign: 'center' }]}>{t('add.photoAnalyzing')}</Text>
      )}

      {phase === 'review' && (
        <View style={{ gap: space.sm }}>
          <Text style={[type.label, { color: colors.gold, marginBottom: 4 }]}>
            {t('add.photoFound', { count: books.length })}
          </Text>
          {books.map((b) => {
            const owned = Boolean(entryFor(b.id));
            const on = selected.has(b.id);
            return (
              <Pressable key={b.id} disabled={owned} onPress={() => toggle(b.id)} style={styles.item}>
                <View style={[styles.check, on && styles.checkOn, owned && { opacity: 0.3 }]}>
                  {(on || owned) && <Icon name="check" size={14} color={colors.bg} strokeWidth={2.4} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, owned && { color: colors.textFaint }]} numberOfLines={1}>
                    {b.title}
                  </Text>
                  <Text style={type.small} numberOfLines={1}>
                    {owned ? t('add.inLibrary') : b.author}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          <Button
            label={t('add.photoConfirm', { count: selected.size })}
            icon="plus"
            disabled={selected.size === 0}
            style={{ marginTop: space.md }}
            onPress={confirm}
          />
          <Button label={t('add.photoRetake')} variant="ghost" onPress={() => setPhase('idle')} />
        </View>
      )}

      <Text style={styles.proto}>{t('add.prototype')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: '#0A0907',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  spines: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, paddingHorizontal: space.lg },
  spine: {
    width: 34,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  spineDetected: { borderColor: colors.goldBright },
  spineText: { fontFamily: fonts.display, fontSize: 10, textAlign: 'center' },
  plank: { height: 12, marginBottom: 18 },
  sweep: { position: 'absolute', top: 0, bottom: 0, width: 80 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  itemTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  proto: { fontFamily: fonts.medium, fontSize: 11, color: colors.textFaint, textAlign: 'center' },
});
