import { i18n } from '@/shared/i18n';
import { ConsentCheckbox } from '@/ui/molecules/ConsentCheckbox';

interface PublishConsentRowProps {
  centerName: string;
  isGranted: boolean;
  onToggle: (isNowGranted: boolean) => void;
}

/** La autorización para publicar la imagen y los vídeos: nace desmarcada y se puede retirar cuando quiera. */
export function PublishConsentRow({
  centerName,
  isGranted,
  onToggle,
}: Readonly<PublishConsentRowProps>): React.JSX.Element {
  return (
    <ConsentCheckbox
      isChecked={isGranted}
      onCheckedChange={onToggle}
      label={i18n.t('teamProfiles.editor.consentLabel', { centerName })}
    />
  );
}
