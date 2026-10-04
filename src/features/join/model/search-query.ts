export const MIN_SEARCH_QUERY_LENGTH = 2;

export function isSearchQueryReady(searchQuery: string): boolean {
  return searchQuery.trim().length >= MIN_SEARCH_QUERY_LENGTH;
}
