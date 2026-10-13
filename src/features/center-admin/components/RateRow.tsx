import { useBanknoteWatermark } from '@/features/passes';
import type { RateListResponseDtoRatesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { BanknoteCard } from '@/ui/organisms/BanknoteCard';

const SERIAL_LENGTH = 6;

interface RateRowProps {
  rate: RateListResponseDtoRatesItem;
  onRemovePress: () => void;
}

/** «Para qué servicios vale»: los nombres o «Todos los servicios». */
function describeServices(rate: RateListResponseDtoRatesItem): string {
  if (rate.services.length === 0) return i18n.t('centerAdmin.passes.allServices');
  return rate.services.map(({ name }) => name).join(', ');
}

/** Un bono a la venta como un billete: las clases en grande, validez, servicios y precio en el sello. */
export function RateRow({ rate, onRemovePress }: Readonly<RateRowProps>): React.JSX.Element {
  const watermark = useBanknoteWatermark();
  const validity = i18n.t('centerAdmin.passes.validDaysFact', { count: rate.validDays });
  const price = formatEuros(rate.priceCents);
  const serial = `Nº ${rate.id.replaceAll('-', '').slice(-SERIAL_LENGTH).toUpperCase()}`;

  return (
    <BanknoteCard
      title={rate.name}
      valueText={String(rate.sessionsCount)}
      unitText={i18n.t('centerAdmin.passes.classesUnit')}
      detailLines={[validity, describeServices(rate)]}
      serialText={serial}
      stampText={price}
      watermark={watermark}
      accessibilityLabel={`${rate.name}. ${String(rate.sessionsCount)} ${i18n.t('centerAdmin.passes.classesUnit')}. ${validity}. ${price}`}
    >
      <Button
        isFullWidth
        size="sm"
        variant="outline"
        leadingIconName="trash"
        label={i18n.t('centerAdmin.passes.removeAction')}
        accessibilityLabel={i18n.t('centerAdmin.passes.removeRate', { name: rate.name })}
        onPress={onRemovePress}
      />
    </BanknoteCard>
  );
}
