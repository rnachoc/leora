import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BookCover } from '../BookCover';
import { Icon } from '../Icon';
import { tap } from '../ui';
import { CATALOG, registerBooks, type Book } from '@/data/books';
import { useI18n } from '@/i18n/I18nProvider';
import { searchBooks } from '@/lib/catalog';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

/** Well-known titles first, so most people find a favourite without typing. */
const POPULAR_IDS = [
  'sombra-viento',
  'cien-anos',
  'reina-roja',
  'nombre-viento',
  'hail-mary',
  'evelyn-hugo',
  'habitos-atomicos',
  'sapiens',
  'circe',
  'paciente-silenciosa',
  'alas-sangre',
  'tokio-blues',
  'orgullo-prejuicio',
  'dune',
  'tres-cuerpos',
  'patria',
  'perdida',
  'cancion-aquiles',
];

const COLS = 3;
const GAP = 12;

type Props = { selected: string[]; onToggle: (book: Book) => void };

/** Tap covers to pick favourite books; search the live catalog for anything else. */
export function FavoriteBooksPicker({ selected, onToggle }: Props) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(0);
  const cell = width ? (width - GAP * (COLS - 1)) / COLS : 0;

  const popular = useMemo(
    () => POPULAR_IDS.map((id) => CATALOG.find((b) => b.id === id)).filter(Boolean) as Book[],
    [],
  );

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      searchBooks(q, controller.signal)
        .then((books) => {
          registerBooks(books);
          setResults(books.slice(0, 12));
        })
        .catch(() => {})
        .finally(() => !controller.signal.aborted && setLoading(false));
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const books = query.trim().length >= 3 ? results : popular;

  return (
    <View style={{ gap: space.lg }}>
      <View style={styles.inputWrap}>
        <Icon name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('add.searchPlaceholder')}
          placeholderTextColor={colors.textFaint}
          autoCorrect={false}
          style={styles.input}
        />
        {loading && <ActivityIndicator size="small" color={colors.gold} />}
      </View>

      <View style={styles.row}>
        <Text style={type.label}>{query.trim().length >= 3 ? t('onb.books.results') : t('onb.books.popular')}</Text>
        <Text style={[type.label, { color: colors.gold }]}>{t('onb.books.selected', { count: selected.length })}</Text>
      </View>

      <View style={styles.grid} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {cell > 0 &&
          books.map((book) => {
            const on = selected.includes(book.id);
            return (
              <Pressable
                key={book.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={book.title}
                onPress={() => {
                  tap('select');
                  onToggle(book);
                }}
                style={({ pressed }) => [{ width: cell }, pressed && { transform: [{ scale: 0.95 }] }]}
              >
                <View style={[styles.coverWrap, on && styles.coverOn]}>
                  <BookCover book={book} width={cell - 6} shadow={false} />
                  {on && (
                    <View style={styles.badge}>
                      <Icon name="check" size={14} color={colors.bg} strokeWidth={2.6} />
                    </View>
                  )}
                </View>
                <Text style={styles.title} numberOfLines={2}>
                  {book.title}
                </Text>
              </Pressable>
            );
          })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 50,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  input: { flex: 1, height: '100%', fontFamily: fonts.body, fontSize: 16, color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, rowGap: 16 },
  coverWrap: { padding: 3, borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
  coverOn: { borderColor: colors.gold },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.textMuted, marginTop: 6 },
});
