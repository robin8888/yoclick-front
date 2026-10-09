import { useActiveCenterSectorId } from '@/features/join';
import { capitalizeFirstLetter, getSectorVocabulary } from '@/shared/i18n';

export interface ContentVocabulary {
  levelWords: readonly string[];
  needs: readonly string[];
  /** «cliente» / «alumno» y su plural, tal como los llama el tipo de centro. */
  clientWord: string;
  clientWordPlural: string;
  /** Lo mismo con mayúscula inicial, para delante de dos puntos. */
  capitalizedClientWord: string;
  /** El nombre de la pestaña («Entrenar», «Practicar»). */
  contentTabLabel: string;
}

/** Las palabras del tipo de centro activo que usan las pantallas de contenido. */
export function useContentVocabulary(): ContentVocabulary {
  const vocabulary = getSectorVocabulary(useActiveCenterSectorId());

  return {
    levelWords: vocabulary.levels,
    needs: vocabulary.needs,
    clientWord: vocabulary.client.singular,
    clientWordPlural: vocabulary.client.plural,
    capitalizedClientWord: capitalizeFirstLetter(vocabulary.client.singular),
    contentTabLabel: vocabulary.contentTabLabel,
  };
}
