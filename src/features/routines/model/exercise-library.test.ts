import { listLibraryCategories } from './exercise-library';

describe('listLibraryCategories', () => {
  it('lists each category once, in the order they first appear', () => {
    const exercises = [
      { category: 'Piernas' },
      { category: 'Empuje' },
      { category: 'Piernas' },
      { category: 'Core' },
    ];

    expect(listLibraryCategories(exercises)).toEqual(['Piernas', 'Empuje', 'Core']);
  });

  it('is empty for an empty library', () => {
    expect(listLibraryCategories([])).toEqual([]);
  });
});
