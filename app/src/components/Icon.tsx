import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '@/theme/tokens';

export type IconName =
  | 'library'
  | 'sparkles'
  | 'user'
  | 'plus'
  | 'search'
  | 'barcode'
  | 'camera'
  | 'star'
  | 'check'
  | 'x'
  | 'chevronLeft'
  | 'chevronRight'
  | 'grid'
  | 'shelf'
  | 'share'
  | 'bookmark'
  | 'cart'
  | 'trophy'
  | 'crown'
  | 'globe'
  | 'link'
  | 'book'
  | 'flame'
  | 'moon'
  | 'feather'
  | 'compass'
  | 'trash';

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number };

/** Minimal stroke icon set (24px grid) drawn with react-native-svg. */
export function Icon({ name, size = 22, color = colors.text, strokeWidth = 1.8 }: Props) {
  const p = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  const shapes = (() => {
    switch (name) {
      case 'library':
        return (
          <>
            <Path d="M4 4v16M8 4v16" {...p} />
            <Path d="M12 5.5 15.5 4.6l4 15-3.5.9z" {...p} />
            <Path d="M3 20h18" {...p} />
          </>
        );
      case 'sparkles':
        return (
          <>
            <Path d="M11 3.5 12.7 8.3 17.5 10l-4.8 1.7L11 16.5l-1.7-4.8L4.5 10l4.8-1.7z" {...p} />
            <Path d="M18.5 15v4M16.5 17h4" {...p} />
          </>
        );
      case 'user':
        return (
          <>
            <Circle cx={12} cy={8} r={4} {...p} />
            <Path d="M4.5 20.5c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5" {...p} />
          </>
        );
      case 'plus':
        return <Path d="M12 5v14M5 12h14" {...p} />;
      case 'search':
        return (
          <>
            <Circle cx={11} cy={11} r={6.5} {...p} />
            <Path d="m16 16 4.5 4.5" {...p} />
          </>
        );
      case 'barcode':
        return <Path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3M7 8v8M10 8v8M13 8v8M16.5 8v8" {...p} />;
      case 'camera':
        return (
          <>
            <Path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z" {...p} />
            <Circle cx={12} cy={13} r={3.5} {...p} />
          </>
        );
      case 'star':
        return (
          <Path
            d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"
            {...p}
            fill={color}
          />
        );
      case 'check':
        return <Path d="m5 12.5 4.5 4.5L19 7.5" {...p} />;
      case 'x':
        return <Path d="M6 6l12 12M18 6 6 18" {...p} />;
      case 'chevronLeft':
        return <Path d="m15 5-7 7 7 7" {...p} />;
      case 'chevronRight':
        return <Path d="m9 5 7 7-7 7" {...p} />;
      case 'grid':
        return (
          <>
            <Rect x={4} y={4} width={6.5} height={6.5} rx={1.5} {...p} />
            <Rect x={13.5} y={4} width={6.5} height={6.5} rx={1.5} {...p} />
            <Rect x={4} y={13.5} width={6.5} height={6.5} rx={1.5} {...p} />
            <Rect x={13.5} y={13.5} width={6.5} height={6.5} rx={1.5} {...p} />
          </>
        );
      case 'shelf':
        return <Path d="M3 10.5h18M3 20h18M5.5 10.5V4.5M8.5 10.5V5.5M12 10.5l2-5.5M6 20v-6M9 20v-5M13 20v-6.5M16 20v-5" {...p} />;
      case 'share':
        return (
          <>
            <Path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" {...p} />
            <Path d="M5 12v7.5h14V12" {...p} />
          </>
        );
      case 'bookmark':
        return <Path d="M6.5 3.5h11v17L12 16.5 6.5 20.5z" {...p} />;
      case 'cart':
        return (
          <>
            <Path d="M3 4h2.5l2.2 10.5h10.8L20.5 7H6.4" {...p} />
            <Circle cx={9} cy={19} r={1.4} {...p} />
            <Circle cx={17} cy={19} r={1.4} {...p} />
          </>
        );
      case 'trophy':
        return (
          <>
            <Path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z" {...p} />
            <Path d="M7.5 6H4.5a3 3 0 0 0 3 4M16.5 6h3a3 3 0 0 1-3 4M12 13.5V17M8.5 20h7M9.5 17h5v3h-5z" {...p} />
          </>
        );
      case 'crown':
        return <Path d="M4 18h16M4.5 15 3.5 7l5 4L12 5l3.5 6 5-4-1 8z" {...p} />;
      case 'globe':
        return (
          <>
            <Circle cx={12} cy={12} r={8.5} {...p} />
            <Path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5S9.6 5.9 12 3.5z" {...p} />
          </>
        );
      case 'link':
        return <Path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" {...p} />;
      case 'book':
        return <Path d="M12 6.5C10 5 7 4.5 3.5 5v13.5C7 18 10 18.5 12 20c2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5V20" {...p} />;
      case 'flame':
        return <Path d="M12 21c3.6 0 6-2.4 6-5.8 0-3.6-3-5.6-3.5-9.7C12 7 9.5 9.6 9.8 12.4 8.6 11.8 8 10.6 8 9.5 6.7 11 6 12.8 6 15.2 6 18.6 8.4 21 12 21z" {...p} />;
      case 'moon':
        return <Path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" {...p} />;
      case 'feather':
        return <Path d="M19 5c-5-1-10.5 2.5-12.5 9L5 19M7 16h6.5c3-1.5 5-5 5.5-11M9 12.5h6.5" {...p} />;
      case 'compass':
        return (
          <>
            <Circle cx={12} cy={12} r={8.5} {...p} />
            <Path d="m15.5 8.5-2 5-5 2 2-5z" {...p} />
          </>
        );
      case 'trash':
        return <Path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5" {...p} />;
    }
  })();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {shapes}
    </Svg>
  );
}
