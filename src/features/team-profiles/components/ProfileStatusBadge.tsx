import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Badge } from '@/ui/atoms/Badge';

import { PROFILE_STATUS_BADGES } from '../model/profile-status';

/** El estado del perfil con palabra, nunca solo con color. */
export function ProfileStatusBadge({
  status,
}: Readonly<{ status: ProfileResponseDto['status'] }>): React.JSX.Element {
  const badge = PROFILE_STATUS_BADGES[status];

  return <Badge label={i18n.t(badge.labelKey)} tone={badge.tone} />;
}
