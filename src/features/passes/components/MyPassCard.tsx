import type { ReactNode } from 'react';

import type { PassListResponseDtoPassesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format';
import { BanknoteCard, type BanknoteTone } from '@/ui/organisms/BanknoteCard';

import { useBanknoteWatermark } from '../hooks/useBanknoteWatermark';
import { buildBanknoteSerial } from '../model/pass-serial';

interface MyPassCardProps {
  pass: PassListResponseDtoPassesItem;
  /** Acciones bajo el billete (en la ficha del alumno: «Quitar bono»). */
  actions?: ReactNode;
}

function resolveTone(status: PassListResponseDtoPassesItem['status']): BanknoteTone {
  if (status === 'active') return 'active';
  return status === 'pending' ? 'pending' : 'inactive';
}

function describeExpiry(pass: PassListResponseDtoPassesItem): string {
  if (pass.status === 'pending') return i18n.t('passes.pendingDetail');
  if (pass.status === 'rejected') return i18n.t('passes.rejectedDetail');
  if (pass.expiresAt === null) return '';
  const key = pass.status === 'expired' ? 'passes.expiredOn' : 'passes.expiresOn';
  return i18n.t(key, { date: formatShortDate(pass.expiresAt) });
}

/** «para todos los servicios» o los nombres. */
function describeServices(pass: PassListResponseDtoPassesItem): string {
  if (pass.services.length === 0) return i18n.t('passes.allServices');
  return pass.services.map(({ name }) => name).join(', ');
}

/** Un bono de la persona como un billete: lo que le queda en grande y su estado con palabra. */
export function MyPassCard({ pass, actions }: Readonly<MyPassCardProps>): React.JSX.Element {
  const watermark = useBanknoteWatermark();
  const status = i18n.t(`passes.status.${pass.status}`);
  const remaining = i18n.t('passes.remaining', {
    count: pass.remainingSessions,
    total: pass.totalSessions,
  });
  const detailLines = [describeExpiry(pass), describeServices(pass)].filter((line) => line !== '');

  return (
    <BanknoteCard
      title={pass.name}
      valueText={String(pass.remainingSessions)}
      unitText={i18n.t('passes.ofTotal', { total: pass.totalSessions })}
      detailLines={detailLines}
      serialText={buildBanknoteSerial(pass.id)}
      stampText={status}
      watermark={watermark}
      tone={resolveTone(pass.status)}
      accessibilityLabel={`${pass.name}. ${status}. ${remaining}. ${detailLines.join('. ')}`}
    >
      {actions}
    </BanknoteCard>
  );
}
