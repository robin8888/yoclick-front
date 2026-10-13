import type { RateListResponseDtoRatesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { BanknoteCard } from '@/ui/organisms/BanknoteCard';

import { useBanknoteWatermark } from '../hooks/useBanknoteWatermark';
import { buildBanknoteSerial } from '../model/pass-serial';

interface RateOfferCardProps {
  rate: RateListResponseDtoRatesItem;
  isBusy: boolean;
  onRequestPress: () => void;
}

/** Un bono que ofrece el centro, como un billete: clases, validez y servicios, con «Pedir» en el talón. */
export function RateOfferCard({
  rate,
  isBusy,
  onRequestPress,
}: Readonly<RateOfferCardProps>): React.JSX.Element {
  const watermark = useBanknoteWatermark();
  const servicesText =
    rate.services.length === 0
      ? i18n.t('passes.allServices')
      : rate.services.map(({ name }) => name).join(', ');
  const validity = i18n.t('passes.validFor', { count: rate.validDays });
  const price = formatEuros(rate.priceCents);

  return (
    <BanknoteCard
      title={rate.name}
      valueText={String(rate.sessionsCount)}
      unitText={i18n.t('passes.unit')}
      detailLines={[validity, servicesText]}
      serialText={buildBanknoteSerial(rate.id)}
      stampText={price}
      watermark={watermark}
      accessibilityLabel={`${rate.name}. ${String(rate.sessionsCount)} ${i18n.t('passes.unit')}. ${validity}. ${price}`}
    >
      <Button
        isFullWidth
        size="sm"
        label={i18n.t('passes.requestAction')}
        accessibilityLabel={i18n.t('passes.requestLabel', { name: rate.name })}
        isDisabled={isBusy}
        onPress={onRequestPress}
      />
    </BanknoteCard>
  );
}
