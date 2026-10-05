// Pantallas con marca Yoclick (antes de unirse a un centro): degradado burdeos con texto e iconos
// blancos, en claro y en oscuro. Los colores salen del logo burdeos de la marca: luz roja en el
// centro que se apaga hacia los bordes. Solo es la marca de plataforma: dentro de un centro se
// usa el fondo neutro del tema.
export const platformHeroGradient = {
  // Color de relleno si el degradado aún no se ha pintado (y para los tests).
  fallbackColor: '#5A0008',
  stops: [
    { offset: 0, color: '#94000F' },
    { offset: 0.55, color: '#5A0008' },
    { offset: 1, color: '#2E0003' },
  ],
  centerX: 0.5,
  centerY: 0.3,
  radiusX: 0.95,
  radiusY: 0.75,
} as const;

const WHITE = '#FFFFFF';

// Sobre el granate: blanco para el texto principal y blanco algo atenuado (más de 9:1) para el
// secundario; las superficies y los bordes son velos blancos para no romper la paleta.
export const platformHeroColorOverrides = {
  ink: WHITE,
  ink2: 'rgba(255,255,255,0.85)',
  surface: 'rgba(255,255,255,0.10)',
  line: 'rgba(255,255,255,0.28)',
  // Botón principal blanco con el texto en el burdeos oscuro del fondo.
  brand: WHITE,
  onBrand: '#5A0008',
} as const;

export const platformAccentColors = {
  icon: WHITE,
  iconTile: 'rgba(255,255,255,0.16)',
} as const;

// Tarjetas blancas sobre el degradado: texto e iconos en los burdeos del propio fondo.
export const platformCardColors = {
  surface: '#FFFFFF',
  title: '#5A0008',
  description: '#94000F',
  icon: '#94000F',
  iconTile: 'rgba(148,0,15,0.10)',
  shadow: '#2E0003',
  // Dorado de la colmena: marca la tarjeta elegida.
  selectedBorder: '#D4AF37',
} as const;

// Colmena dorada muy sutil sobre el degradado: solo líneas finas y casi transparentes.
export const platformHeroHoneycomb = {
  color: '#D4AF37',
  lineOpacity: 0.18,
  lineWidth: 1.1,
  /** Distancia del centro de cada celda a sus vértices, en puntos. */
  cellRadius: 28,
} as const;
