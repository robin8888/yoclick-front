import type { BrandTokens, ThemeMode } from './brand-engine';
import type { MotionTokens } from './motion';
import type { colorTokens, radiusTokens, spaceTokens, typeStyleTokens } from './tokens';

export type { ThemeMode };
export type ThemePreference = ThemeMode | 'system';

type NeutralColorName = keyof (typeof colorTokens)['light'];

export type ThemeColors = Readonly<Record<NeutralColorName, string>> & Readonly<BrandTokens>;

export interface TypeStyle {
  readonly fontFamily: 'display' | 'sans';
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: '400' | '500' | '600' | '700' | '800';
  readonly letterSpacing: number;
}

export type TypeStyleName = keyof typeof typeStyleTokens;

export interface Theme {
  readonly mode: ThemeMode;
  readonly colors: ThemeColors;
  readonly space: typeof spaceTokens;
  readonly radius: typeof radiusTokens;
  readonly type: Readonly<Record<TypeStyleName, TypeStyle>>;
  readonly motion: MotionTokens;
}
