import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BookCover } from '../BookCover';
import { Icon } from '../Icon';
import { Stars } from '../Stars';
import { Button, Chip, tap } from '../ui';
import type { Book } from '@/data/books';
import { STATUSES, type ReadingStatus } from '@/data/library';
import { useI18n } from '@/i18n/I18nProvider';
import { useLibrary } from '@/store/LibraryProvider';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

/** A search/scan result that expands to choose status (and rating) before adding. */
export function AddBookRow({ book, initiallyOpen = false }: { book: Book; initiallyOpen?: boolean }) {
  const { t } = useI18n();
  const { entryFor, dispatch } = useLibrary();
  const [open, setOpen] = useState(initiallyOpen);
  const [status, setStatus] = useState<ReadingStatus>('read');
  const [rating, setRating] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const inLibrary = Boolean(entryFor(book.id));

  return (
    <View style={[styles.row, open && styles.rowOpen]}>
      <Pressable
        disabled={inLibrary}
        onPress={() => {
          tap('select');
          setOpen((o) => !o);
        }}
        style={styles.head}
      >
        <BookCover book={book} width={44} shadow={false} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {book.title}
          </Text>
          <Text style={type.small} numberOfLines={1}>
            {book.author} · {book.year}
          </Text>
        </View>
        {inLibrary ? (
          <View style={styles.badge}>
            <Icon name="check" size={12} color={colors.gold} />
            <Text style={styles.badgeText}>{justAdded ? t('add.added') : t('add.inLibrary')}</Text>
          </View>
        ) : (
          <Icon name={open ? 'x' : 'plus'} size={20} color={colors.gold} />
        )}
      </Pressable>

      {open && !inLibrary && (
        <View style={styles.body}>
          <Text style={type.label}>{t('add.addAs')}</Text>
          <View style={styles.statuses}>
            {STATUSES.map((s) => (
              <Chip key={s} label={t(`status.${s}`)} selected={status === s} onPress={() => setStatus(s)} />
            ))}
          </View>
          {status === 'read' && <Stars value={rating} size={30} gap={8} onChange={setRating} />}
          <Button
            label={t('library.add')}
            icon="plus"
            size="sm"
            disabled={status === 'read' && rating === 0}
            onPress={() => {
              tap('success');
              dispatch({ type: 'add', bookId: book.id, status, rating: status === 'read' ? rating : undefined });
              setJustAdded(true);
              setOpen(false);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowOpen: { borderColor: colors.gold },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, marginBottom: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.goldDim,
  },
  badgeText: { fontFamily: fonts.medium, fontSize: 11, color: colors.goldBright },
  body: { gap: space.md, paddingHorizontal: space.md, paddingBottom: space.md },
  statuses: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
