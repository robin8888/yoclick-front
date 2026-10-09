import { useState } from 'react';

import type { ContentResponseDto } from '@/shared/api/generated/model';

interface SelectedContent {
  content: ContentResponseDto | null;
  select: (content: ContentResponseDto) => void;
  clear: () => void;
}

/** La pieza sobre la que hay una hoja abierta, o ninguna. */
export function useSelectedContent(): SelectedContent {
  const [content, setContent] = useState<ContentResponseDto | null>(null);

  return {
    content,
    select: setContent,
    clear: () => {
      setContent(null);
    },
  };
}
