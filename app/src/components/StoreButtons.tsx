import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { tap } from './ui';
import type { Book } from '@/data/books';
import { useI18n } from '@/i18n/I18nProvider';
import { storeLinks } from '@/lib/stores';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

/** "Get it" row: one pill per store, opening the (affiliate) link. */
export function StoreButtons({ book }: { book: Book }) {
  const { t } = useI18n();
  return (
    <View>
      <Text style={[type.label, { marginBottom: space.sm }]}>{t('discover.buy')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {storeLinks(book).map((s) => (
          <Pressable
            key={s.id}
            accessibilityRole="link"
            onPress={() => {
              tap();
              Linking.openURL(s.url);
            }}
            style={({ pressed }) => [styles.store, pressed && { opacity: 0.7 }]}
          >
            <Icon name="cart" size={14} color={colors.text} />
            <Text style={styles.label}>{s.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  store: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  label: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.text },
});
