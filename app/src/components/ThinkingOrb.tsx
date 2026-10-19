import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, type } from '@/theme/tokens';

/** Pulsing gold orb with rotating status lines, shown while picks are being computed. */
export function ThinkingOrb({ messages }: { messages: string[] }) {
  const [pulse] = useState(() => new Animated.Value(0));
  const [spin] = useState(() => new Animated.Value(0));
  const [i, setI] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    const rotate = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    rotate.start();
    const timer = setInterval(() => setI((n) => Math.min(n + 1, messages.length - 1)), 900);
    return () => {
      loop.stop();
      rotate.stop();
      clearInterval(timer);
    };
  }, [messages.length, pulse, spin]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.08] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.halo, { opacity: haloOpacity, transform: [{ scale }] }]} />
      <Animated.View style={{ transform: [{ scale }, { rotate }] }}>
        <LinearGradient
          colors={[colors.goldBright, colors.gold, '#7A5A2E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.orb}
        />
      </Animated.View>
      <Text style={[type.heading, styles.text]}>{messages[i]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  halo: {
    position: 'absolute',
    top: 50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.gold,
  },
  orb: { width: 100, height: 100, borderRadius: 50 },
  text: { marginTop: 56, textAlign: 'center' },
});
