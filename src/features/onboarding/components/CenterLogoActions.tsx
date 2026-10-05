import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

interface CenterLogoActionsProps {
  hasPickedLogo: boolean;
  isBusy: boolean;
  onLogoPick: () => void;
  onLogoUpload: () => void;
  onSkip: () => void;
}

/** Sin imagen elegida: «Elegir logo». Con ella: «Usar este logo» y «Elegir otro». Siempre «Ahora no». */
function PickedLogoActions({
  isBusy,
  onLogoPick,
  onLogoUpload,
}: Readonly<
  Pick<CenterLogoActionsProps, 'isBusy' | 'onLogoPick' | 'onLogoUpload'>
>): React.JSX.Element {
  return (
    <>
      <Button
        label={i18n.t('onboarding.logo.uploadAction')}
        isFullWidth
        isLoading={isBusy}
        onPress={onLogoUpload}
      />
      <Button
        variant="outline"
        label={i18n.t('onboarding.logo.chooseAnotherAction')}
        isFullWidth
        isDisabled={isBusy}
        onPress={onLogoPick}
      />
    </>
  );
}

export function CenterLogoActions({
  hasPickedLogo,
  isBusy,
  onLogoPick,
  onLogoUpload,
  onSkip,
}: Readonly<CenterLogoActionsProps>): React.JSX.Element {
  return (
    <>
      {hasPickedLogo ? (
        <PickedLogoActions isBusy={isBusy} onLogoPick={onLogoPick} onLogoUpload={onLogoUpload} />
      ) : (
        <Button
          label={i18n.t('onboarding.logo.chooseAction')}
          leadingIconName="camera"
          isFullWidth
          isLoading={isBusy}
          onPress={onLogoPick}
        />
      )}
      <Button
        variant="ghost"
        label={i18n.t('onboarding.logo.skipAction')}
        isFullWidth
        isDisabled={isBusy}
        onPress={onSkip}
      />
    </>
  );
}
