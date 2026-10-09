import { buildMediaCaption } from './media-caption';

const LEVEL_WORDS = ['Inicio', 'Base', 'Avanzado'] as const;

describe('buildMediaCaption', () => {
  it('joins the kind, the level and the need', () => {
    expect(
      buildMediaCaption({ kind: 'video', level: 'intermediate', need: 'Fuerza' }, LEVEL_WORDS),
    ).toBe('Vídeo · Base · Fuerza');
  });

  it('leaves out what the piece does not have', () => {
    expect(buildMediaCaption({ kind: 'pdf', level: null, need: null }, LEVEL_WORDS)).toBe('PDF');
    expect(buildMediaCaption({ kind: 'pdf', level: 'beginner', need: null }, LEVEL_WORDS)).toBe(
      'PDF · Inicio',
    );
  });
});
