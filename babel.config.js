// Sin plugins propios: babel-preset-expo ya resuelve el alias `@/` mediante
// los `paths` de tsconfig.json (Metro lo soporta de forma nativa).
module.exports = function configureBabel(api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'] };
};
