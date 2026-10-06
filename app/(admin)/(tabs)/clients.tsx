import { AdminComingSoonScreen } from '@/features/center-admin';
import { i18n } from '@/shared/i18n';

export default function AdminClientsRoute(): React.JSX.Element {
  return <AdminComingSoonScreen title={i18n.t('centerAdmin.comingSoon.clientsTitle')} />;
}
