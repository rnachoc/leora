import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { hashOf, inkFor } from './BookCover';
import { tap } from './ui';
import type { Book } from '@/data/books';
import type { ShelfItem } from '@/store/LibraryProvider';
import { colors, fonts, shade, withAlpha } from '@/theme/tokens';

const GAP = 3;
const SIDE = 14;

function spineSize(book: Book) {
  const h = hashOf(book.id);
  const width = Math.round(Math.min(46, Math.max(26, 20 + book.pages / 30)));
  const height = 150 + (h % 5) * 9;
  return { width, height };
}

function Spine({ book, dimmed }: { book: Book; dimmed?: boolean }) {
  const router = useRouter();
  const { width, height } = spineSize(book);
  const ink = inkFor(book.color);
  const variant = hashOf(book.id + 'spine') % 3;

  return (
    <Pressable
      accessibilityLabel={`${book.title}, ${book.author}`}
      onPress={() => {
        tap();
        router.push({ pathname: '/book/[id]', params: { id: book.id } });
      }}
      style={({ pressed }) => [{ transform: [{ translateY: pressed ? -10 : 0 }] }, dimmed && { opacity: 0.55 }]}
    >
      <LinearGradient
        colors={[shade(book.color, -0.25), shade(book.color, 0.1), book.color, shade(book.color, -0.3)]}
        locations={[0, 0.25, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.spine, { width, height }]}
      >
        {variant !== 2 && <View style={[styles.spineBand, { top: 12, backgroundColor: withAlpha(ink, 0.45) }]} />}
        {variant === 0 && <View style={[styles.spineBand, { bottom: 12, backgroundColor: withAlpha(ink, 0.45) }]} />}
        {variant === 2 && <View style={[styles.spineDot, { borderColor: withAlpha(ink, 0.5) }]} />}

        {/* Rotated title: a box with swapped dimensions, rotated around its centre. */}
        <View
          style={{
            position: 'absolute',
            width: height - 64,
            height: width,
            left: (width - (height - 64)) / 2,
            top: (height - width) / 2,
            transform: [{ rotate: '-90deg' }],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fonts.display,
              fontSize: width > 34 ? 11.5 : 10,
              color: ink,
              letterSpacing: 0.3,
            }}
          >
            {book.title}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/** Lays spines out in rows that fit the available width, each row resting on a wooden shelf. */
export function Bookshelf({ items }: { items: ShelfItem[] }) {
  const [width, setWidth] = useState(0);

  const rows: ShelfItem[][] = [];
  if (width > 0) {
    let row: ShelfItem[] = [];
    let used = 0;
    const max = width - SIDE * 2;
    for (const item of items) {
      const w = spineSize(item.book).width + GAP;
      if (used + w > max && row.length) {
        rows.push(row);
        row = [];
        used = 0;
      }
      row.push(item);
      used += w;
    }
    if (row.length) rows.push(row);
  }

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.books}>
            {row.map(({ book, entry }) => (
              <Spine key={book.id} book={book} dimmed={entry.status === 'dnf'} />
            ))}
          </View>
          <LinearGradient colors={[colors.woodEdge, colors.wood, colors.woodShadow]} style={styles.plank} />
          <LinearGradient colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']} style={styles.plankShadow} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 26 },
  books: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: GAP,
    paddingHorizontal: SIDE,
    minHeight: 190,
  },
  spine: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    overflow: 'hidden',
  },
  spineBand: { position: 'absolute', left: 4, right: 4, height: 2 },
  spineDot: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  plank: {
    height: 14,
    borderRadius: 3,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,220,170,0.12)',
  },
  plankShadow: { height: 18, marginHorizontal: 6 },
});
