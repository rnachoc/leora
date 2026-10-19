import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, IconButton } from '../ui';
import { useI18n } from '@/i18n/I18nProvider';
import { colors, radius, space, type } from '@/theme/tokens';

type Props = {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  cta: string;
  ctaDisabled?: boolean;
  onNext: () => void;
  onBack: () => void;
  children: ReactNode;
};

/** Layout shared by every questionnaire step: progress, question, answers and a sticky continue button. */
export function StepShell({ step, total, title, subtitle, cta, ctaDisabled, onNext, onBack, children }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, [step, enter]);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient
        colors={['rgba(201,164,106,0.12)', 'rgba(201,164,106,0)']}
        style={styles.glow}
        pointerEvents="none"
      />
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <IconButton icon="chevronLeft" label={t('common.back')} onPress={onBack} />
        <View style={styles.progress}>
          {Array.from({ length: total }, (_, i) => (
            <View key={i} style={[styles.segment, i < step && styles.segmentOn]} />
          ))}
        </View>
        <Text style={styles.count}>
          {step}/{total}
        </Text>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Animated.View
          style={{
            opacity: enter,
            transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
          }}
        >
          <Text style={type.hero}>{title}</Text>
          {subtitle ? <Text style={[type.body, styles.subtitle]}>{subtitle}</Text> : null}
          <View style={{ marginTop: space.xl }}>{children}</View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        <Button label={cta} disabled={ctaDisabled} onPress={onNext} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  progress: { flex: 1, flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceHigh },
  segmentOn: { backgroundColor: colors.gold },
  count: { ...type.label, minWidth: 28, textAlign: 'right' },
  content: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxl },
  subtitle: { color: colors.textMuted, marginTop: space.sm },
  footer: {
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
