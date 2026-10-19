import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { Book } from '@/data/books';
import { useCoverUrl } from '@/lib/covers';
import { fonts, shade, withAlpha } from '@/theme/tokens';

/** Stable small integer from a string — used to vary cover/spine designs. */
export function hashOf(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function isLight(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

export function inkFor(hex: string) {
  return isLight(hex) ? '#1E1913' : '#F6EEDF';
}

type Props = { book: Book; width: number; style?: ViewStyle; shadow?: boolean };

/**
 * Real cover from the catalog when there is one; otherwise (and while it
 * loads, or if it fails) a cover generated from the book's colour.
 */
export function BookCover({ book, width, style, shadow = true }: Props) {
  const primary = useCoverUrl(book);
  const [failed, setFailed] = useState<string[]>([]);
  // Try the main cover, then the fallback (e.g. edition cover → work cover), then the generated one.
  const coverUrl = [primary, book.coverFallbackUrl].find((u): u is string => Boolean(u) && !failed.includes(u!));
  const showImage = Boolean(coverUrl);
  const height = Math.round(width * 1.5);
  const ink = inkFor(book.color);
  const variant = hashOf(book.id) % 3;
  const scale = width / 120;
  const titleSize = Math.max(9, Math.round((book.title.length > 22 ? 14 : 17) * scale));

  return (
    <View
      style={[
        { width, height, borderRadius: Math.max(3, 6 * scale) },
        shadow && styles.shadow,
        shadow && { shadowColor: book.color },
        style,
      ]}
    >
      <LinearGradient
        colors={[shade(book.color, 0.12), book.color, shade(book.color, -0.35)]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: Math.max(3, 6 * scale), overflow: 'hidden' }]}
      >
        {/* Spine hinge */}
        <View style={[styles.hinge, { width: Math.max(3, 7 * scale), backgroundColor: withAlpha('#000000', 0.18) }]} />
        <View style={[styles.hingeLight, { left: Math.max(3, 7 * scale) }]} />

        {variant === 0 && (
          <View
            style={[
              styles.frame,
              { margin: 9 * scale, borderColor: withAlpha(ink, 0.35), borderWidth: Math.max(0.5, scale) },
            ]}
          />
        )}
        {variant === 1 && (
          <View
            style={[styles.band, { top: height * 0.58, height: 3 * scale, backgroundColor: withAlpha(ink, 0.5) }]}
          />
        )}
        {variant === 2 && (
          <View
            style={[
              styles.orb,
              {
                width: width * 0.62,
                height: width * 0.62,
                borderRadius: width,
                top: height * 0.4,
                left: width * 0.19,
                borderColor: withAlpha(ink, 0.3),
                borderWidth: Math.max(0.5, scale),
              },
            ]}
          />
        )}

        <View style={{ flex: 1, padding: 14 * scale, paddingLeft: 16 * scale, justifyContent: 'space-between' }}>
          <Text
            numberOfLines={4}
            style={{
              fontFamily: fonts.display,
              fontSize: titleSize,
              lineHeight: titleSize * 1.15,
              color: ink,
              textAlign: variant === 0 ? 'center' : 'left',
              marginTop: variant === 0 ? 10 * scale : 0,
            }}
          >
            {book.title}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fonts.semibold,
              fontSize: Math.max(6, 8.5 * scale),
              letterSpacing: 1.2 * scale,
              textTransform: 'uppercase',
              color: withAlpha(ink, 0.8),
              textAlign: variant === 0 ? 'center' : 'left',
              marginBottom: variant === 0 ? 6 * scale : 0,
            }}
          >
            {book.author}
          </Text>
        </View>

        {showImage && (
          <>
            <Image
              source={{ uri: coverUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={250}
              accessibilityLabel={book.title}
              onError={() => coverUrl && setFailed((f) => [...f, coverUrl])}
            />
            <View
              style={[styles.hinge, { width: Math.max(2, 4 * scale), backgroundColor: withAlpha('#000000', 0.22) }]}
            />
            <View style={[styles.hingeLight, { left: Math.max(2, 4 * scale) }]} />
          </>
        )}

        {/* Sheen */}
        <LinearGradient
          colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.6, y: 0.5 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  hinge: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  hingeLight: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  frame: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 2 },
  band: { position: 'absolute', left: 0, right: 0 },
  orb: { position: 'absolute', alignSelf: 'center' },
});
