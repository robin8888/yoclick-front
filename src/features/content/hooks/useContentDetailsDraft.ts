import { useState } from 'react';

import type { ContentResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import type { ChoiceOption } from '../model/choice-option';
import { CONTENT_LEVELS, describeContentLevel, type ContentLevel } from '../model/content-levels';
import { useContentVocabulary } from './useContentVocabulary';

interface ContentDetailsDraft {
  title: string;
  level: ContentLevel | null;
  need: string | null;
  levelOptions: ChoiceOption<ContentLevel | null>[];
  needOptions: ChoiceOption<string | null>[];
  onTitleChange: (title: string) => void;
  onLevelSelect: (level: ContentLevel | null) => void;
  onNeedSelect: (need: string | null) => void;
}

/** Lo que se está editando de una pieza y las opciones de nivel y necesidad del tipo de centro. */
export function useContentDetailsDraft(content: ContentResponseDto): ContentDetailsDraft {
  const vocabulary = useContentVocabulary();
  const [title, setTitle] = useState(content.title);
  const [level, setLevel] = useState<ContentLevel | null>(content.level);
  const [need, setNeed] = useState<string | null>(content.need);

  return {
    title,
    level,
    need,
    levelOptions: [
      { value: null, label: i18n.t('content.details.noLevel') },
      ...CONTENT_LEVELS.map((value) => ({
        value,
        label: describeContentLevel(value, vocabulary.levelWords),
      })),
    ],
    needOptions: [
      { value: null, label: i18n.t('content.details.noNeed') },
      ...vocabulary.needs.map((value) => ({ value, label: value })),
    ],
    onTitleChange: setTitle,
    onLevelSelect: setLevel,
    onNeedSelect: setNeed,
  };
}
