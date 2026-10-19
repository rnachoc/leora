import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '../Icon';
import { AddBookRow } from './AddBookRow';
import { CATALOG } from '@/data/books';
import { useI18n } from '@/i18n/I18nProvider';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

/** Accent- and case-insensitive text normalisation for search. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export function SearchTab() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (q.length < 2) return [];
    return CATALOG.filter((b) => norm(b.title).includes(q) || norm(b.author).includes(q)).slice(0, 20);
  }, [query]);

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
          style={styles.input}
        />
      </View>

      {query.trim().length < 2 ? (
        <Text style={[type.small, styles.hint]}>{t('add.searchHint')}</Text>
      ) : results.length === 0 ? (
        <Text style={[type.small, styles.hint]}>{t('add.noResults', { query: query.trim() })}</Text>
      ) : (
        <View style={{ gap: space.sm }}>
          {results.map((b) => (
            <AddBookRow key={b.id} book={b} />
          ))}
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
  hint: { textAlign: 'center', marginTop: space.xl },
});
