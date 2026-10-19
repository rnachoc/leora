import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { Button, IconButton, Screen, tap } from '@/components/ui';
import { FREE_RECOMMENDATIONS_PER_MONTH } from '@/data/library';
import { useI18n } from '@/i18n/I18nProvider';
import { useLibrary } from '@/store/LibraryProvider';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

type Plan = 'yearly' | 'monthly';

/** Paywall. Production wires the CTA to RevenueCat (App Store / Google Play billing). */
export default function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const { t } = useI18n();
  const { dispatch } = useLibrary();
  const [plan, setPlan] = useState<Plan>('yearly');

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={['rgba(201,164,106,0.35)', 'rgba(201,164,106,0.05)', colors.bg]}
        locations={[0, 0.4, 0.75]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <IconButton icon="x" label={t('common.close')} onPress={close} style={[styles.close, { top: insets.top + 8 }]} />

      <Screen tabBar={false} contentStyle={{ paddingTop: insets.top + 56 }}>
        <View style={styles.body}>
          <LinearGradient colors={[colors.goldBright, '#8A6A3A']} style={styles.crown}>
            <Icon name="crown" size={34} color={colors.bg} strokeWidth={2} />
          </LinearGradient>

          {reason === 'limit' && (
            <Text style={styles.limit}>{t('premium.limit', { total: FREE_RECOMMENDATIONS_PER_MONTH })}</Text>
          )}

          <Text style={[type.hero, styles.center]}>{t('premium.title')}</Text>
          <Text style={[type.body, styles.center, { color: colors.textMuted, marginTop: 8 }]}>
            {t('premium.subtitle')}
          </Text>

          <View style={styles.features}>
            {(['premium.f1', 'premium.f2', 'premium.f3', 'premium.f4'] as const).map((k) => (
              <View key={k} style={styles.feature}>
                <View style={styles.tick}>
                  <Icon name="check" size={14} color={colors.bg} strokeWidth={2.4} />
                </View>
                <Text style={type.body}>{t(k)}</Text>
              </View>
            ))}
          </View>

          <View style={{ gap: space.md, alignSelf: 'stretch' }}>
            {(['yearly', 'monthly'] as const).map((p) => {
              const active = plan === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => {
                    tap('select');
                    setPlan(p);
                  }}
                  style={[styles.plan, active && styles.planActive]}
                >
                  <View style={[styles.radio, active && styles.radioOn]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planName}>{t(`premium.${p}`)}</Text>
                    <Text style={type.small}>{t(`premium.${p}Price`)}</Text>
                  </View>
                  {p === 'yearly' && (
                    <View style={styles.save}>
                      <Text style={styles.saveText}>{t('premium.save')}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <Button
            label={t('premium.cta')}
            style={{ alignSelf: 'stretch', marginTop: space.xl }}
            onPress={() => {
              tap('success');
              dispatch({ type: 'setPremium', value: true });
              close();
            }}
          />
          <Text style={[type.small, styles.center, { marginTop: space.md, fontSize: 12 }]}>{t('premium.legal')}</Text>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  close: { position: 'absolute', right: space.lg, zIndex: 10 },
  body: { paddingHorizontal: space.xl, alignItems: 'center' },
  center: { textAlign: 'center' },
  crown: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xl,
  },
  limit: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.goldBright,
    textAlign: 'center',
    marginBottom: space.md,
  },
  features: { alignSelf: 'stretch', gap: space.md, marginVertical: space.xxl },
  feature: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  tick: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  planActive: { borderColor: colors.gold, backgroundColor: colors.surfaceHigh },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.gold },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.gold },
  planName: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  save: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.gold },
  saveText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.bg },
});
