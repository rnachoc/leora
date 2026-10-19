import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BookCover } from '@/components/BookCover';
import { Bookshelf } from '@/components/Bookshelf';
import { CoverGrid } from '@/components/CoverGrid';
import { Button, Card, Chip, IconButton, ProgressBar, Screen, Segmented, tap } from '@/components/ui';
import { STATUSES, type ReadingStatus } from '@/data/library';
import { useI18n } from '@/i18n/I18nProvider';
import { useLibrary } from '@/store/LibraryProvider';
import { colors, fonts, space, type } from '@/theme/tokens';

type Filter = 'all' | ReadingStatus;

export default function LibraryScreen() {
  const router = useRouter();
  const { t, formatNumber } = useI18n();
  const { items, profile } = useLibrary();
  const [view, setView] = useState<'shelf' | 'grid'>('shelf');
  const [filter, setFilter] = useState<Filter>('all');

  const read = items.filter((i) => i.entry.status === 'read');
  const pages = read.reduce((sum, i) => sum + i.book.pages, 0);
  const current = items.find((i) => i.entry.status === 'reading');

  const visible = useMemo(() => {
    const list = filter === 'all' ? items : items.filter((i) => i.entry.status === filter);
    // Shelf order: what you're reading, then finished books (newest first), then the rest.
    const rank: Record<ReadingStatus, number> = { reading: 0, read: 1, want: 2, dnf: 3 };
    return [...list].sort(
      (a, b) =>
        rank[a.entry.status] - rank[b.entry.status] ||
        (b.entry.readAt ?? b.entry.addedAt).localeCompare(a.entry.readAt ?? a.entry.addedAt),
    );
  }, [items, filter]);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={type.label}>{t('library.greeting', { name: profile.name })}</Text>
          <Text style={[type.hero, { marginTop: 6 }]}>{t('library.title')}</Text>
          <Text style={[type.small, { marginTop: 6 }]}>
            {t('library.count', { count: read.length, pages: formatNumber(pages) })}
          </Text>
        </View>
        <IconButton icon="plus" accent label={t('library.add')} onPress={() => router.push('/add')} />
      </View>

      {current && (
        <Pressable
          onPress={() => {
            tap();
            router.push({ pathname: '/book/[id]', params: { id: current.book.id } });
          }}
          style={{ paddingHorizontal: space.xl }}
        >
          <Card style={styles.reading}>
            <BookCover book={current.book} width={58} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[type.label, { color: colors.gold }]}>{t('library.readingNow')}</Text>
              <Text style={type.heading} numberOfLines={1}>
                {current.book.title}
              </Text>
              <Text style={type.small} numberOfLines={1}>
                {current.book.author}
              </Text>
              <View style={{ marginTop: 6, gap: 6 }}>
                <ProgressBar value={current.entry.progress ?? 0} />
                <Text style={styles.progressLabel}>
                  {t('library.progress', { percent: Math.round((current.entry.progress ?? 0) * 100) })}
                </Text>
              </View>
            </View>
          </Card>
        </Pressable>
      )}

      {items.length < 5 && (
        <View style={{ paddingHorizontal: space.xl, marginTop: current ? space.lg : 0 }}>
          <Card style={styles.starter}>
            <Text style={type.heading}>{t('library.starter.title')}</Text>
            <Text style={type.small}>{t('library.starter.body')}</Text>
            <View style={styles.starterActions}>
              <Button
                size="sm"
                icon="search"
                label={t('library.starter.search')}
                style={{ flex: 1 }}
                onPress={() => router.push('/add')}
              />
              <Button
                size="sm"
                variant="secondary"
                icon="camera"
                label={t('library.starter.photo')}
                style={{ flex: 1 }}
                onPress={() => router.push({ pathname: '/add', params: { tab: 'photo' } })}
              />
            </View>
          </Card>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <Chip label={t('status.all')} selected={filter === 'all'} onPress={() => setFilter('all')} />
        {STATUSES.map((s) => (
          <Chip
            key={s}
            label={`${t(`status.${s}.plural`)} · ${items.filter((i) => i.entry.status === s).length}`}
            selected={filter === s}
            onPress={() => setFilter(s)}
          />
        ))}
      </ScrollView>

      <View style={styles.viewToggle}>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: 'shelf', label: t('library.view.shelf'), icon: 'shelf' },
            { value: 'grid', label: t('library.view.grid'), icon: 'grid' },
          ]}
        />
      </View>

      {visible.length === 0 ? (
        <Text style={[type.small, styles.empty]}>{t('library.empty')}</Text>
      ) : view === 'shelf' ? (
        <View style={{ paddingHorizontal: space.md }}>
          <Bookshelf items={visible} />
        </View>
      ) : (
        <View style={{ paddingHorizontal: space.xl }}>
          <CoverGrid items={visible} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.lg,
    paddingHorizontal: space.xl,
    marginBottom: space.xl,
  },
  reading: { flexDirection: 'row', gap: space.lg, alignItems: 'center' },
  starter: { gap: space.sm, borderColor: colors.gold },
  starterActions: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  progressLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  filters: { gap: 8, paddingHorizontal: space.xl, paddingVertical: space.xl },
  viewToggle: { paddingHorizontal: space.xl, marginBottom: space.xl },
  empty: { textAlign: 'center', marginTop: 40 },
});
