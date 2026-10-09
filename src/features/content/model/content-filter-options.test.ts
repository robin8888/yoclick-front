import { buildLevelFilterOptions, buildNeedFilterOptions } from './content-filter-options';

describe('buildLevelFilterOptions', () => {
  it('starts with «Todos» and names the levels with the words of the sector', () => {
    expect(buildLevelFilterOptions(['Inicio', 'Base', 'Avanzado'])).toEqual([
      { value: null, label: 'Todos' },
      { value: 'beginner', label: 'Inicio' },
      { value: 'intermediate', label: 'Base' },
      { value: 'advanced', label: 'Avanzado' },
    ]);
  });
});

describe('buildNeedFilterOptions', () => {
  it('starts with «Todas» and keeps the needs in order', () => {
    expect(buildNeedFilterOptions(['Fuerza', 'Cardio'])).toEqual([
      { value: null, label: 'Todas' },
      { value: 'Fuerza', label: 'Fuerza' },
      { value: 'Cardio', label: 'Cardio' },
    ]);
  });
});
