/** Las categorías de la biblioteca, sin repetir y en el orden en que aparecen. */
export function listLibraryCategories(exercises: readonly { category: string }[]): string[] {
  return [...new Set(exercises.map(({ category }) => category))];
}
