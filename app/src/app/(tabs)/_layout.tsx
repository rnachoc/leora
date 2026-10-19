import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { TabBar } from '@/components/TabBar';
import { useI18n } from '@/i18n/I18nProvider';
import { useLibrary } from '@/store/LibraryProvider';
import { colors } from '@/theme/tokens';

export default function TabsLayout() {
  const { t } = useI18n();
  const { profile } = useLibrary();

  // First launch (or after a reset): run the welcome questionnaire first.
  if (!profile.onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.library') }} />
      <Tabs.Screen name="discover" options={{ title: t('tabs.discover') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
    </Tabs>
  );
}
