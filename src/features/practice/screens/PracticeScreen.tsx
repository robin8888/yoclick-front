import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

/** Pestaña «Practicar» del prototipo: rutinas y vídeos del centro (fase 2, aún sin contenido). */
export function PracticeScreen(): React.JSX.Element {
  return (
    <ScreenTemplate title={i18n.t('practice.title')}>
      <Text variant="titleMd">{i18n.t('practice.emptyTitle')}</Text>
      <Text color="ink2">{i18n.t('practice.emptyDescription')}</Text>
    </ScreenTemplate>
  );
}
