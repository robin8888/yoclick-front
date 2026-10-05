// GENERADO por scripts/generate-tokens.mjs a partir de docs/design/tokens.json.
// No editar a mano: ejecuta `npm run tokens:gen`.

export const colorTokens = {
  "light": {
    "bg": "#FFFFFF",
    "surface": "#FFFFFF",
    "surface2": "#EDEDE9",
    "line": "#E3E3DE",
    "lineStrong": "#7C828A",
    "ink": "#121416",
    "ink2": "#555B63",
    "brand": "#E4572E",
    "onBrand": "#000000",
    "brandInk": "#B64625",
    "brandSoft": "#FCEBE6",
    "focus": "#1D4ED8",
    "success": "#17734A",
    "successSoft": "#E3F2EA",
    "warning": "#8F5200",
    "warningSoft": "#FBEFD9",
    "danger": "#BF2E24",
    "dangerSoft": "#FBE5E3",
    "onDanger": "#FFFFFF",
    "info": "#2555C9",
    "infoSoft": "#E6ECFA",
    "scrim": "rgba(18,20,22,0.45)"
  },
  "dark": {
    "bg": "#0D0E10",
    "surface": "#16181B",
    "surface2": "#1F2226",
    "line": "#2A2E33",
    "lineStrong": "#6E757D",
    "ink": "#F1F2F3",
    "ink2": "#A3A9B0",
    "brand": "#E4572E",
    "onBrand": "#000000",
    "brandInk": "#E8724F",
    "brandSoft": "#3F251F",
    "focus": "#8DB0FF",
    "success": "#4CC38A",
    "successSoft": "#15291F",
    "warning": "#EEA63F",
    "warningSoft": "#2E2413",
    "danger": "#FF7B70",
    "dangerSoft": "#33191A",
    "onDanger": "#000000",
    "info": "#86A6FF",
    "infoSoft": "#18203A",
    "scrim": "rgba(0,0,0,0.6)"
  }
} as const;

export const spaceTokens = {
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "8": 32,
  "10": 40
} as const;

export const radiusTokens = {
  "sm": 8,
  "md": 14,
  "lg": 20,
  "xl": 28,
  "pill": 999
} as const;

export const typeFamilyTokens = {
  "display": "Outfit",
  "sans": "Outfit"
} as const;

export const typeStyleTokens = {
  "display": {
    "fontFamily": "display",
    "fontSize": 36,
    "lineHeight": 38,
    "fontWeight": "800",
    "letterSpacing": -0.36
  },
  "metric": {
    "fontFamily": "display",
    "fontSize": 30,
    "lineHeight": 32,
    "fontWeight": "800",
    "letterSpacing": 0
  },
  "titleLg": {
    "fontFamily": "display",
    "fontSize": 26,
    "lineHeight": 30,
    "fontWeight": "700",
    "letterSpacing": 0
  },
  "titleMd": {
    "fontFamily": "sans",
    "fontSize": 20,
    "lineHeight": 26,
    "fontWeight": "700",
    "letterSpacing": 0
  },
  "body": {
    "fontFamily": "sans",
    "fontSize": 17,
    "lineHeight": 24,
    "fontWeight": "400",
    "letterSpacing": 0
  },
  "bodyStrong": {
    "fontFamily": "sans",
    "fontSize": 17,
    "lineHeight": 24,
    "fontWeight": "600",
    "letterSpacing": 0
  },
  "caption": {
    "fontFamily": "sans",
    "fontSize": 15,
    "lineHeight": 20,
    "fontWeight": "500",
    "letterSpacing": 0
  },
  "overline": {
    "fontFamily": "sans",
    "fontSize": 13,
    "lineHeight": 16,
    "fontWeight": "700",
    "letterSpacing": 1.04
  }
} as const;

export const shadowTokens = {
  "light": {
    "card": "0 1px 2px rgba(18,20,22,0.05), 0 6px 18px rgba(18,20,22,0.06)",
    "sheet": "0 -8px 32px rgba(18,20,22,0.16)"
  },
  "dark": {
    "card": "0 1px 2px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.35)",
    "sheet": "0 -8px 32px rgba(0,0,0,0.6)"
  }
} as const;
