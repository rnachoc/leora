import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BookCover } from './BookCover';
import { Icon } from './Icon';
import { StoreButtons } from './StoreButtons';
import { Button, Chip, tap } from './ui';
import { genreLabel } from '@/data/taxonomy';
import { useI18n } from '@/i18n/I18nProvider';
import type { Recommendation } from '@/lib/recommend';
import { useLibrary, type DismissReason } from '@/store/LibraryProvider';
import { colors, fonts, radius, space, type, withAlpha } from '@/theme/tokens';

const REASONS: DismissReason[] = ['read', 'notForMe', 'tooLong', 'author'];

export function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const { book, why } = rec;
  const router = useRouter();
  const { t, locale } = useI18n();
  const { entryFor, dispatch } = useLibrary();
  const [state, setState] = useState<'open' | 'asking' | 'dismissed'>('open');
  const saved = entryFor(book.id)?.status === 'want';

  if (state === 'dismissed') {
    return (
      <View style={[styles.card, styles.dismissed]}>
        <Icon name="check" size={18} color={colors.gold} />
        <Text style={type.small}>{t('discover.thanks')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { borderColor: withAlpha(book.color, 0.45) }]}>
      <Pressable
        onPress={() => {
          tap();
          router.push({ pathname: '/book/[id]', params: { id: book.id } });
        }}
        style={styles.top}
      >
        <BookCover book={book} width={96} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[type.label, { color: colors.gold }]}>#{index + 1}</Text>
          <Text style={type.heading}>{book.title}</Text>
          <Text style={type.small}>{book.author}</Text>
          <Text style={[type.small, { color: colors.textFaint }]}>
            {book.genres.map((g) => genreLabel(g, locale)).join(' · ')} · {book.pages} p.
          </Text>
        </View>
      </Pressable>

      <Text style={[type.body, { color: colors.textMuted, fontSize: 14 }]}>{book.synopsis[locale]}</Text>

      <View style={styles.why}>
        <View style={styles.whyHeader}>
          <Icon name="sparkles" size={15} color={colors.gold} />
          <Text style={[type.label, { color: colors.gold }]}>{t('discover.why')}</Text>
        </View>
        <Text style={[type.body, { fontSize: 14 }]}>{why}</Text>
      </View>

      <StoreButtons book={book} />

      {state === 'asking' ? (
        <View style={{ gap: space.sm }}>
          <Text style={type.label}>{t('discover.dismissWhy')}</Text>
          <View style={styles.reasons}>
            {REASONS.map((r) => (
              <Chip
                key={r}
                label={t(`discover.reason.${r}`)}
                onPress={() => {
                  dispatch({ type: 'dismiss', bookId: book.id, reason: r });
                  if (r === 'read') dispatch({ type: 'add', bookId: book.id, status: 'read' });
                  setState('dismissed');
                }}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          <Button
            size="sm"
            label={saved ? t('discover.inWantList') : t('discover.wantToRead')}
            icon={saved ? 'check' : 'bookmark'}
            disabled={saved}
            style={{ flex: 1 }}
            onPress={() => dispatch({ type: 'add', bookId: book.id, status: 'want' })}
          />
          <Button
            size="sm"
            variant="secondary"
            label={t('discover.dismiss')}
            icon="x"
            style={{ flex: 1 }}
            onPress={() => setState('asking')}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.lg,
    gap: space.lg,
  },
  dismissed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderColor: colors.border,
  },
  top: { flexDirection: 'row', gap: space.lg, alignItems: 'flex-start' },
  why: {
    backgroundColor: colors.goldDim,
    borderRadius: radius.md,
    padding: space.md,
    gap: 6,
  },
  whyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actions: { flexDirection: 'row', gap: space.sm },
});
