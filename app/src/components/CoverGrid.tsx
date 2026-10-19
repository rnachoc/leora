import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BookCover } from './BookCover';
import { Stars } from './Stars';
import { tap } from './ui';
import { useI18n } from '@/i18n/I18nProvider';
import type { ShelfItem } from '@/store/LibraryProvider';
import { colors, fonts } from '@/theme/tokens';

const COLS = 3;
const GAP = 14;

export function CoverGrid({ items }: { items: ShelfItem[] }) {
  const router = useRouter();
  const { t } = useI18n();
  const [width, setWidth] = useState(0);
  const cell = width > 0 ? (width - GAP * (COLS - 1)) / COLS : 0;

  return (
    <View style={styles.grid} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {cell > 0 &&
        items.map(({ book, entry }) => (
          <Pressable
            key={book.id}
            onPress={() => {
              tap();
              router.push({ pathname: '/book/[id]', params: { id: book.id } });
            }}
            style={({ pressed }) => [{ width: cell }, pressed && { transform: [{ scale: 0.96 }] }]}
          >
            <BookCover book={book} width={cell} style={entry.status === 'dnf' ? { opacity: 0.5 } : undefined} />
            <View style={styles.meta}>
              {entry.status === 'read' ? (
                <Stars value={entry.rating} size={11} gap={1} />
              ) : (
                <Text style={styles.status}>{t(`status.${entry.status}`)}</Text>
              )}
            </View>
          </Pressable>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, rowGap: 20 },
  meta: { marginTop: 8, height: 14, justifyContent: 'center' },
  status: { fontFamily: fonts.medium, fontSize: 11, color: colors.gold },
});
