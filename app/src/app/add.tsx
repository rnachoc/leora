import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PhotoTab } from '@/components/add/PhotoTab';
import { ScanTab } from '@/components/add/ScanTab';
import { SearchTab } from '@/components/add/SearchTab';
import { IconButton, Screen, Segmented } from '@/components/ui';
import { useI18n } from '@/i18n/I18nProvider';
import { space, type } from '@/theme/tokens';

type Tab = 'search' | 'scan' | 'photo';

export default function AddBookScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab ?? 'search');

  return (
    <Screen tabBar={false} keyboardShouldPersistTaps="handled" contentStyle={{ paddingTop: insets.top + space.md }}>
      <View style={styles.header}>
        <Text style={type.title}>{t('add.title')}</Text>
        <IconButton
          icon="x"
          label={t('common.close')}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      </View>

      <View style={styles.body}>
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'search', label: t('add.tab.search'), icon: 'search' },
            { value: 'scan', label: t('add.tab.scan'), icon: 'barcode' },
            { value: 'photo', label: t('add.tab.photo'), icon: 'camera' },
          ]}
        />
        <View style={{ marginTop: space.xl }}>
          {tab === 'search' && <SearchTab />}
          {tab === 'scan' && <ScanTab />}
          {tab === 'photo' && <PhotoTab />}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    marginBottom: space.xl,
  },
  body: { paddingHorizontal: space.xl },
});
