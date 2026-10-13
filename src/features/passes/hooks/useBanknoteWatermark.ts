import { useActiveCenterSummary } from '@/features/auth';
import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import type { BanknoteWatermark } from '@/ui/organisms/BanknoteCard';

/** El logo del centro activo, con su URL completa, para la marca de agua de los bonos. */
export function useBanknoteWatermark(): BanknoteWatermark {
  const center = useActiveCenterSummary();
  return { centerName: center.name, logoUrl: resolveApiAssetUrl(center.logoUrl) };
}
