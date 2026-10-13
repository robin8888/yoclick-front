import { useBanknoteWatermark } from '@/features/passes';
import type { PassListResponseDtoPassesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { BanknoteCard } from '@/ui/organisms/BanknoteCard';

const SERIAL_LENGTH = 6;

interface PendingPassCardProps {
  pass: PassListResponseDtoPassesItem;
  isBusy: boolean;
  onActivatePress: () => void;
  onRejectPress: () => void;
}

/** Un bono pedido como un billete ámbar: quién lo pide y cuánto cuesta, con las acciones en el talón. */
export function PendingPassCard({
  pass,
  isBusy,
  onActivatePress,
  onRejectPress,
}: Readonly<PendingPassCardProps>): React.JSX.Element {
  const watermark = useBanknoteWatermark();
  const requestedBy = i18n.t('centerAdmin.passes.pendingRequestedBy', {
    name: pass.client.fullName,
  });
  const price = formatEuros(pass.priceCents);
  const serial = `Nº ${pass.id.replaceAll('-', '').slice(-SERIAL_LENGTH).toUpperCase()}`;

  return (
    <BanknoteCard
      tone="pending"
      title={pass.name}
      valueText={String(pass.totalSessions)}
      unitText={i18n.t('centerAdmin.passes.classesUnit')}
      detailLines={[requestedBy, price]}
      serialText={serial}
      stampText={i18n.t('centerAdmin.passes.pendingStamp')}
      watermark={watermark}
      accessibilityLabel={`${pass.name}. ${requestedBy}. ${price}`}
    >
      <Button
        size="sm"
        label={i18n.t('centerAdmin.passes.activateAction')}
        isDisabled={isBusy}
        onPress={onActivatePress}
      />
      <Button
        size="sm"
        variant="outline"
        label={i18n.t('centerAdmin.passes.rejectAction')}
        isDisabled={isBusy}
        onPress={onRejectPress}
      />
    </BanknoteCard>
  );
}
