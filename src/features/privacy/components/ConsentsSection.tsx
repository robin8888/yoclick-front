import { View } from 'react-native';

import type { MyConsentsResponseDtoConsentsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useSetConsent } from '../hooks/usePrivacyMutations';
import {
  createCardStyle,
  createConsentRowStyle,
  GROW_STYLE,
  SECTION_STYLE,
} from './Privacy.styles';

type OptionalConsent = 'marketing' | 'image';

function isGranted(consents: readonly MyConsentsResponseDtoConsentsItem[], kind: string): boolean {
  return consents.find((consent) => consent.kind === kind)?.isGranted === true;
}

interface ConsentRowProps {
  title: string;
  hint: string;
  isOn: boolean;
  isDisabled: boolean;
  onToggle: (isNowOn: boolean) => void;
}

function ConsentRow({
  title,
  hint,
  isOn,
  isDisabled,
  onToggle,
}: Readonly<ConsentRowProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createConsentRowStyle(theme)}>
      <View style={GROW_STYLE}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="caption" color="ink2">
          {hint}
        </Text>
      </View>
      <Switch isOn={isOn} isDisabled={isDisabled} accessibilityLabel={title} onToggle={onToggle} />
    </View>
  );
}

function OptionalConsentRows({
  consents,
}: Readonly<{ consents: readonly MyConsentsResponseDtoConsentsItem[] }>): React.JSX.Element {
  const setConsent = useSetConsent();
  const optionalKinds: readonly OptionalConsent[] = ['marketing', 'image'];

  return (
    <>
      {optionalKinds.map((kind) => (
        <ConsentRow
          key={kind}
          title={i18n.t(`privacy.consents.${kind}Title`)}
          hint={i18n.t(`privacy.consents.${kind}Hint`)}
          isOn={isGranted(consents, kind)}
          isDisabled={setConsent.isRunning}
          onToggle={(isNowOn) => {
            setConsent.run({ kind, isGranted: isNowOn });
          }}
        />
      ))}
      {setConsent.errorMessage === null ? null : (
        <FormErrorBanner message={setConsent.errorMessage} />
      )}
    </>
  );
}

/** Los consentimientos de la persona: el de privacidad es obligatorio y los demás se pueden retirar cuando quiera. */
export function ConsentsSection({
  consents,
}: Readonly<{ consents: readonly MyConsentsResponseDtoConsentsItem[] }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('privacy.consents.title')}
      </Text>
      <View style={createCardStyle(theme)}>
        <ConsentRow
          title={i18n.t('privacy.consents.privacyTitle')}
          hint={i18n.t('privacy.consents.privacyHint')}
          isOn
          isDisabled
          onToggle={() => undefined}
        />
        <OptionalConsentRows consents={consents} />
      </View>
      <Text variant="caption" color="ink2">
        {i18n.t('privacy.consents.note')}
      </Text>
    </View>
  );
}
