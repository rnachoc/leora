import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from './Icon';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

export function tap(kind: 'light' | 'select' | 'success' = 'light') {
  if (Platform.OS === 'web') return;
  if (kind === 'select') Haptics.selectionAsync();
  else if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Scrollable screen with safe-area padding, room for the floating tab bar and a warm top glow. */
export function Screen({
  children,
  tabBar = true,
  contentStyle,
  ...rest
}: ScrollViewProps & { tabBar?: boolean; contentStyle?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['rgba(201,164,106,0.10)', 'rgba(201,164,106,0)']}
        style={styles.glow}
        pointerEvents="none"
      />
      <ScrollView
        {...rest}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { paddingTop: insets.top + space.lg, paddingBottom: (tabBar ? 120 : 40) + insets.bottom },
          contentStyle,
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

type ButtonProps = PressableProps & {
  label: string;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, icon, variant = 'primary', size = 'md', style, disabled, onPress, ...rest }: ButtonProps) {
  const fg = variant === 'primary' ? colors.bg : colors.text;
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPress={(e) => {
        tap();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} color={fg} />}
      <Text style={[styles.buttonLabel, size === 'sm' && { fontSize: 13 }, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  accent,
  label,
  style,
}: {
  icon: IconName;
  onPress?: () => void;
  accent?: boolean;
  label: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.iconButton,
        accent && { backgroundColor: colors.gold, borderColor: colors.gold },
        pressed && { transform: [{ scale: 0.92 }] },
        style,
      ]}
    >
      <Icon name={icon} size={20} color={accent ? colors.bg : colors.text} />
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  emoji,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  emoji?: string;
}) {
  return (
    <Pressable
      onPress={() => {
        tap('select');
        onPress?.();
      }}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && { opacity: 0.8 }]}
    >
      {emoji ? <Text style={{ fontSize: 13 }}>{emoji}</Text> : null}
      <Text style={[styles.chipLabel, selected && { color: colors.bg }]}>{label}</Text>
    </Pressable>
  );
}

/** Segmented control. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: IconName }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => {
              tap('select');
              onChange(o.value);
            }}
            style={[styles.segment, active && styles.segmentActive]}
          >
            {o.icon && <Icon name={o.icon} size={16} color={active ? colors.bg : colors.textMuted} />}
            {o.label ? (
              <Text style={[styles.segmentLabel, active && { color: colors.bg }]} numberOfLines={1}>
                {o.label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={type.label}>{children}</Text>
      {right}
    </View>
  );
}

export function ProgressBar({ value, height = 6 }: { value: number; height?: number }) {
  return (
    <View style={{ height, borderRadius: height, backgroundColor: colors.surfaceHigh, overflow: 'hidden' }}>
      <LinearGradient
        colors={[colors.gold, colors.goldBright]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, height: '100%', borderRadius: height }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
  },
  buttonSm: { height: 38, paddingHorizontal: 14 },
  buttonPrimary: { backgroundColor: colors.gold },
  buttonSecondary: { backgroundColor: colors.surfaceHigh, borderWidth: 1, borderColor: colors.borderStrong },
  buttonLabel: { fontFamily: fonts.semibold, fontSize: 15 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  segmented: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
  },
  segmentActive: { backgroundColor: colors.gold },
  segmentLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
});
