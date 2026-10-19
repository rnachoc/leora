import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, fonts } from '@/theme/tokens';

/** Circular progress ring for the yearly reading goal. */
export function GoalRing({ done, goal, size = 132 }: { done: number; goal: number; size?: number }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, goal ? done / goal : 0);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="goal" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.goldBright} />
            <Stop offset="1" stopColor={colors.gold} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceHigh} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#goal)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          fill="none"
        />
      </Svg>
      <Text style={{ fontFamily: fonts.display, fontSize: 34, color: colors.text, lineHeight: 38 }}>{done}</Text>
      <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted }}>/ {goal}</Text>
    </View>
  );
}
