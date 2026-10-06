import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

interface AdminComingSoonScreenProps {
  title: string;
}

/** Pestaña del prototipo (`aclients`, `acontent`, `abrand`) cuya pantalla aún no está construida. */
export function AdminComingSoonScreen({
  title,
}: Readonly<AdminComingSoonScreenProps>): React.JSX.Element {
  return (
    <ScreenTemplate title={title}>
      <Text color="ink2">{i18n.t('centerAdmin.comingSoon.description')}</Text>
    </ScreenTemplate>
  );
}
