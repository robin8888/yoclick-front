import { View } from 'react-native';

import { useCopyToClipboard } from '@/shared/hooks/useCopyToClipboard';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Skeleton } from '@/ui/atoms/Skeleton';
import { Text } from '@/ui/atoms/Text';

import { useStudentCode } from '../hooks/useStudentCode';
import { createVoiceCardStyle } from './VoiceCard.styles';

const CODE_SKELETON_HEIGHT = 56;

function CodeBody({ code }: Readonly<{ code: string }>): React.JSX.Element {
  const { copyText, isCopied } = useCopyToClipboard();

  return (
    <>
      <Text
        variant="titleLg"
        selectable
        accessibilityLabel={i18n.t('voiceReceptionist.studentCode.codeA11y', {
          digits: code.split('').join(' '),
        })}
      >
        {code}
      </Text>
      <Button
        variant="secondary"
        leadingIconName="copy"
        label={i18n.t(
          isCopied
            ? 'voiceReceptionist.studentCode.copiedAction'
            : 'voiceReceptionist.studentCode.copyAction',
        )}
        onPress={() => {
          copyText(code);
        }}
      />
    </>
  );
}

/**
 * El código de 6 cifras de quien mira en este centro: con él se identifica por teléfono ante el
 * contestador. Si no carga, la pantalla donde está sigue funcionando: solo avisa y deja reintentar.
 */
export function StudentCodeCard(): React.JSX.Element {
  const theme = useTheme();
  const studentCode = useStudentCode();

  return (
    <View style={createVoiceCardStyle(theme)}>
      <Text variant="bodyStrong">{i18n.t('voiceReceptionist.studentCode.title')}</Text>
      <Text color="ink2">{i18n.t('voiceReceptionist.studentCode.description')}</Text>
      {studentCode.isPending ? <Skeleton height={CODE_SKELETON_HEIGHT} /> : null}
      {studentCode.isSuccess ? <CodeBody code={studentCode.data.code} /> : null}
      {studentCode.isError ? (
        <>
          <Text color="danger">{i18n.t('voiceReceptionist.studentCode.errorMessage')}</Text>
          <Button
            variant="outline"
            label={i18n.t('voiceReceptionist.studentCode.retryAction')}
            isLoading={studentCode.isFetching}
            onPress={() => {
              void studentCode.refetch();
            }}
          />
        </>
      ) : null}
    </View>
  );
}
