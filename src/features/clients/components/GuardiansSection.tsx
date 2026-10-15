import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { IconButton } from '@/ui/atoms/IconButton';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useClient } from '../hooks/useClient';
import { useGuardianLinking, useGuardians } from '../hooks/useGuardians';
import { useSetIsStudent } from '../hooks/useSetIsStudent';

const STACK_STYLE = { gap: 8 } as const;
const ROW_STYLE = { flexDirection: 'row', alignItems: 'center', gap: 12 } as const;
const GROW_STYLE = { flex: 1 } as const;

/** «Cuenta como alumno»: un tutor que no da clase no es alumno (no cuenta para el plan ni en los informes). */
function IsStudentRow({
  membershipId,
}: Readonly<{ membershipId: string }>): React.JSX.Element | null {
  const client = useClient(membershipId).data;
  const student = useSetIsStudent(membershipId);
  if (client === undefined) return null;

  return (
    <View style={ROW_STYLE}>
      <View style={GROW_STYLE}>
        <Text variant="bodyStrong">{i18n.t('clients.guardians.isStudentLabel')}</Text>
        <Text variant="caption" color="ink2">
          {i18n.t('clients.guardians.isStudentHint')}
        </Text>
      </View>
      <Switch
        isOn={client.isStudent}
        accessibilityLabel={i18n.t('clients.guardians.isStudentLabel')}
        onToggle={student.setIsStudent}
      />
    </View>
  );
}

function GuardianRows({
  guardians,
  linking,
}: Readonly<{
  guardians: readonly { membershipId: string; fullName: string; email: string }[];
  linking: ReturnType<typeof useGuardianLinking>;
}>): React.JSX.Element {
  return (
    <>
      {guardians.map((guardian) => (
        <View key={guardian.membershipId} style={ROW_STYLE}>
          <Avatar name={guardian.fullName} size="md" isDecorative />
          <View style={GROW_STYLE}>
            <Text variant="bodyStrong">{guardian.fullName}</Text>
            <Text variant="caption" color="ink2">
              {guardian.email}
            </Text>
          </View>
          <IconButton
            iconName="trash"
            accessibilityLabel={i18n.t('clients.guardians.removeLabel', {
              name: guardian.fullName,
            })}
            isDisabled={linking.isBusy}
            onPress={() => {
              linking.unlink(guardian.membershipId);
            }}
          />
        </View>
      ))}
    </>
  );
}

/**
 * «Tutores» de la ficha: quién es responsable de esta persona. Los menores no tienen cuenta con la
 * que hablar o reservar: lo hace su tutor, y es el centro quien enlaza a cada uno.
 */
export function GuardiansSection({
  membershipId,
}: Readonly<{ membershipId: string }>): React.JSX.Element {
  const router = useRouter();
  const guardians = useGuardians(membershipId);
  const linking = useGuardianLinking(membershipId);
  const list = guardians.data?.guardians ?? [];

  return (
    <View style={STACK_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('clients.guardians.title')}
      </Text>
      <Text variant="caption" color="ink2">
        {i18n.t('clients.guardians.hint')}
      </Text>
      <IsStudentRow membershipId={membershipId} />
      <GuardianRows guardians={list} linking={linking} />
      {linking.errorMessage === null ? null : <FormErrorBanner message={linking.errorMessage} />}
      <Button
        variant="outline"
        leadingIconName="plus"
        label={i18n.t('clients.guardians.addAction')}
        onPress={() => {
          router.push({
            pathname: '/(admin)/guardians/link',
            params: { childMembershipId: membershipId },
          });
        }}
      />
    </View>
  );
}
