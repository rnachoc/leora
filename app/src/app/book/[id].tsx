import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookCover } from '@/components/BookCover';
import { ProgressControl } from '@/components/ProgressControl';
import { Icon } from '@/components/Icon';
import { Stars } from '@/components/Stars';
import { Button, Card, Chip, IconButton, Screen, SectionTitle, tap } from '@/components/ui';
import { getBook, registerBooks } from '@/data/books';
import { STATUSES } from '@/data/library';
import { genreLabel } from '@/data/taxonomy';
import { useI18n } from '@/i18n/I18nProvider';
import { fetchDescription } from '@/lib/catalog';
import { localToday as today } from '@/lib/dates';
import { useLibrary } from '@/store/LibraryProvider';
import { colors, fonts, radius, space, type, withAlpha } from '@/theme/tokens';

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, locale, formatDate } = useI18n();
  const { entryFor, dispatch } = useLibrary();
  const book = getBook(id ?? '');
  const entry = book ? entryFor(book.id) : undefined;

  const [review, setReview] = useState(entry?.review ?? '');
  const [saved, setSaved] = useState(false);
  const [justFinished, setJustFinished] = useState(false);
  useEffect(() => setReview(entry?.review ?? ''), [entry?.review]);

  // Catalog books arrive without a synopsis: fetch it once and keep it on the book.
  const [synopsis, setSynopsis] = useState(book?.synopsis[locale] ?? '');
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!book) return;
    if (book.synopsis[locale]) return setSynopsis(book.synopsis[locale]);
    const controller = new AbortController();
    fetchDescription(book, controller.signal)
      .then((text) => {
        if (!text) return;
        registerBooks([{ ...book, synopsis: { es: text, en: text } }]);
        setSynopsis(text);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [book, locale]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!book) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={[withAlpha(book.color, 0.55), withAlpha(book.color, 0.12), colors.bg]}
        locations={[0, 0.35, 0.7]}
        style={styles.backdrop}
        pointerEvents="none"
      />
      <IconButton
        icon="chevronLeft"
        label={t('common.back')}
        onPress={goBack}
        style={[styles.back, { top: insets.top + 8 }]}
      />

      <Screen tabBar={false} contentStyle={{ paddingTop: insets.top + 64 }}>
        <View style={styles.hero}>
          <View style={[styles.coverGlow, { shadowColor: book.color }]}>
            <BookCover book={book} width={176} />
          </View>
          <Text style={[type.title, styles.center, { marginTop: space.xl }]}>{book.title}</Text>
          <Text style={[type.body, styles.center, { color: colors.textMuted, marginTop: 4 }]}>{book.author}</Text>
          {(book.year > 0 || book.pages > 0) && (
            <Text style={[type.small, styles.center, { marginTop: 8 }]}>
              {[book.year > 0 && String(book.year), book.pages > 0 && t('book.pages', { pages: book.pages })]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          )}
          <View style={styles.tags}>
            {book.genres.map((g) => (
              <View key={g} style={styles.tag}>
                <Text style={styles.tagText}>{genreLabel(g, locale)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.body}>
          {synopsis ? (
            <Pressable onPress={() => setExpanded((e) => !e)}>
              <Text style={[type.body, { color: colors.textMuted }]} numberOfLines={expanded ? undefined : 6}>
                {synopsis}
              </Text>
              {synopsis.length > 320 && (
                <Text style={styles.more}>{expanded ? t('book.readLess') : t('book.readMore')}</Text>
              )}
            </Pressable>
          ) : null}

          {entry ? (
            <>
              <Card style={{ gap: space.lg }}>
                <View>
                  <SectionTitle>{t('book.status')}</SectionTitle>
                  <View style={styles.statusRow}>
                    {STATUSES.map((s) => (
                      <Chip
                        key={s}
                        label={t(`status.${s}`)}
                        selected={entry.status === s}
                        onPress={() => dispatch({ type: 'update', bookId: book.id, patch: { status: s } })}
                      />
                    ))}
                  </View>
                </View>

                {entry.status === 'reading' && (
                  <View style={{ gap: space.md }}>
                    <SectionTitle>{t('book.progress')}</SectionTitle>
                    <ProgressControl
                      value={entry.progress ?? 0}
                      pages={book.pages || undefined}
                      label={(v) =>
                        book.pages
                          ? t('book.pageOf', {
                              page: Math.round(v * book.pages),
                              pages: book.pages,
                              percent: Math.round(v * 100),
                            })
                          : t('library.progress', { percent: Math.round(v * 100) })
                      }
                      onChange={(progress) => dispatch({ type: 'update', bookId: book.id, patch: { progress } })}
                    />
                    <Button
                      label={t('book.finished')}
                      icon="check"
                      onPress={() => {
                        tap('success');
                        dispatch({
                          type: 'update',
                          bookId: book.id,
                          patch: { status: 'read', progress: 1, readAt: today() },
                        });
                        setJustFinished(true);
                      }}
                    />
                  </View>
                )}

                {entry.status !== 'want' && entry.status !== 'reading' && (
                  <View>
                    {justFinished && entry.status === 'read' && (
                      <Text style={styles.congrats}>🎉 {t('book.congrats')}</Text>
                    )}
                    <SectionTitle>{t('book.yourRating')}</SectionTitle>
                    <Stars
                      value={entry.rating}
                      size={34}
                      gap={8}
                      onChange={(rating) => dispatch({ type: 'update', bookId: book.id, patch: { rating } })}
                    />
                    {entry.readAt && entry.status === 'read' && (
                      <Text style={[type.small, { marginTop: 10 }]}>
                        {t('book.readOn', { date: formatDate(entry.readAt) })}
                      </Text>
                    )}
                  </View>
                )}
              </Card>

              <Card>
                <SectionTitle
                  right={
                    review !== (entry.review ?? '') || saved ? (
                      <Pressable
                        onPress={() => {
                          tap('success');
                          dispatch({ type: 'update', bookId: book.id, patch: { review: review.trim() } });
                          setSaved(true);
                          setTimeout(() => setSaved(false), 1600);
                        }}
                      >
                        <Text style={styles.save}>{saved ? `✓ ${t('book.saved')}` : t('book.save')}</Text>
                      </Pressable>
                    ) : null
                  }
                >
                  {t('book.review')}
                </SectionTitle>
                <TextInput
                  value={review}
                  onChangeText={setReview}
                  placeholder={t('book.reviewPlaceholder')}
                  placeholderTextColor={colors.textFaint}
                  multiline
                  style={styles.review}
                />
              </Card>
            </>
          ) : (
            <View style={{ flexDirection: 'row', gap: space.md }}>
              <Button
                label={t('status.read')}
                icon="check"
                style={{ flex: 1 }}
                onPress={() => dispatch({ type: 'add', bookId: book.id, status: 'read' })}
              />
              <Button
                label={t('status.want')}
                icon="bookmark"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => dispatch({ type: 'add', bookId: book.id, status: 'want' })}
              />
            </View>
          )}

          <Button
            label={t('book.moreLikeThis')}
            icon="sparkles"
            variant="secondary"
            onPress={() => router.push({ pathname: '/discover', params: { seed: book.id } })}
          />

          {entry && (
            <Pressable
              onPress={() => {
                dispatch({ type: 'remove', bookId: book.id });
                goBack();
              }}
              style={styles.remove}
            >
              <Icon name="trash" size={16} color={colors.danger} />
              <Text style={[type.small, { color: colors.danger }]}>{t('book.remove')}</Text>
            </Pressable>
          )}
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 560 },
  back: { position: 'absolute', left: space.lg, zIndex: 10 },
  hero: { alignItems: 'center', paddingHorizontal: space.xl },
  coverGlow: {
    shadowOpacity: 0.7,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
  },
  center: { textAlign: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: space.md },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.goldDim,
  },
  tagText: { fontFamily: fonts.medium, fontSize: 12, color: colors.goldBright },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  body: { paddingHorizontal: space.xl, marginTop: space.xl, gap: space.lg },
  review: {
    minHeight: 90,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    textAlignVertical: 'top',
  },
  save: { fontFamily: fonts.semibold, fontSize: 13, color: colors.gold },
  congrats: { fontFamily: fonts.semibold, fontSize: 15, color: colors.goldBright, marginBottom: space.md },
  more: { fontFamily: fonts.semibold, fontSize: 13, color: colors.gold, marginTop: 6 },
  remove: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: space.md,
  },
});
