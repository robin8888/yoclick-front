/** `true` si la ruta es la del prefijo o cuelga de ella (`/book` y `/book/staff`, pero no `/bookings`). */
export function isPathInside(currentPath: string, pathPrefix: string): boolean {
  return currentPath === pathPrefix || currentPath.startsWith(`${pathPrefix}/`);
}

export function isAnyPathInside(currentPath: string, pathPrefixes: readonly string[]): boolean {
  return pathPrefixes.some((pathPrefix) => isPathInside(currentPath, pathPrefix));
}
