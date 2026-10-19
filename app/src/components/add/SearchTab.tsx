import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '../Icon';
import { AddBookRow } from './AddBookRow';
import { CATALOG } from '@/data/books';
import { useI18n } from '@/i18n/I18nProvider';
import { norm } from '@/lib/text';
import { useCatalogSearch } from '@/lib/useCatalogSearch';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

/**
 * Search: instant matches from books Leora already knows, then live results
 * from the catalog (debounced, cancelled when the query changes).
 */
export function SearchTab() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const q = norm(query.trim());
  const { books: remote, status } = useCatalogSearch(query);

  const local = useMemo(
    () => (q.length < 2 ? [] : CATALOG.filter((b) => norm(b.title).includes(q) || norm(b.author).includes(q))),
    [q],
  );

  // Don't repeat a catalog result that matches a book we already show.
  const seen = new Set(local.map((b) => `${norm(b.title)}|${norm(b.author.split(',')[0])}`));
  const results = [...local, ...remote.filter((b) => !seen.has(`${norm(b.title)}|${norm(b.author.split(',')[0])}`))];

  return (
    <View style={{ gap: space.lg }}>
      <View style={styles.inputWrap}>
        <Icon name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('add.searchPlaceholder')}
          placeholderTextColor={colors.textFaint}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
          style={styles.input}
        />
        {status === 'loading' && <ActivityIndicator size="small" color={colors.gold} />}
      </View>

      {q.length < 2 ? (
        <Text style={[type.small, styles.hint]}>{t('add.searchHint')}</Text>
      ) : (
        <View style={{ gap: space.sm }}>
          {results.map((b) => (
            <AddBookRow key={b.id} book={b} />
          ))}
          {status === 'loading' && results.length === 0 && (
            <Text style={[type.small, styles.hint]}>{t('add.searching')}</Text>
          )}
          {status === 'error' && <Text style={[type.small, styles.hint]}>{t('add.searchError')}</Text>}
          {status === 'idle' && results.length === 0 && q.length >= 3 && (
            <Text style={[type.small, styles.hint]}>{t('add.noResults', { query: query.trim() })}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 52,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  input: { flex: 1, height: '100%', fontFamily: fonts.body, fontSize: 16, color: colors.text },
  hint: { textAlign: 'center', marginTop: space.lg },
});
