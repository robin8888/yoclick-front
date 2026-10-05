import { Controller, type Control } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import { ACCOUNT_ROLES, type RegisterAccountFormValues } from '../schemas/auth-forms.schema';
import { AccountRoleCard } from './AccountRoleCard';

interface AccountRoleFieldProps {
  control: Control<RegisterAccountFormValues>;
}

const ROLE_ICON_NAMES = { owner: 'home', instructor: 'users', client: 'user' } as const;

/** «Soy…»: solo decide la primera pantalla tras entrar; los permisos los da cada centro. */
export function AccountRoleField({ control }: Readonly<AccountRoleFieldProps>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name="accountRole"
      render={({ field, fieldState }) => (
        <>
          <Text variant="titleMd">{i18n.t('auth.register.roleQuestion')}</Text>
          {ACCOUNT_ROLES.map((accountRole) => (
            <AccountRoleCard
              key={accountRole}
              iconName={ROLE_ICON_NAMES[accountRole]}
              title={i18n.t(`auth.register.roles.${accountRole}.title`)}
              description={i18n.t(`auth.register.roles.${accountRole}.description`)}
              isSelected={field.value === accountRole}
              onPress={() => {
                field.onChange(accountRole);
              }}
            />
          ))}
          {fieldState.error === undefined ? null : (
            <Text variant="caption" color="danger" role="alert">
              {fieldState.error.message}
            </Text>
          )}
        </>
      )}
    />
  );
}
