import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';

import {
  GRANTABLE_PERMISSIONS,
  togglePermission,
  type GrantablePermission,
} from '../model/team-permissions';

const SECTION_STYLE = { gap: 12 } as const;
const ROW_STYLE = { flexDirection: 'row', alignItems: 'center', gap: 12 } as const;
const ROW_TEXT_STYLE = { flex: 1 } as const;

const PERMISSION_TEXT_KEYS = {
  'reports:view': 'reports',
  'clients:manage': 'clients',
  'services:manage': 'services',
} as const satisfies Record<GrantablePermission, string>;

interface TeamPermissionsSectionProps {
  grantedPermissions: readonly GrantablePermission[];
  clientWord: string;
  onGrantedPermissionsChange: (permissions: GrantablePermission[]) => void;
}

/** Qué más puede hacer quien da las sesiones; el servidor es quien lo hace cumplir. */
export function TeamPermissionsSection({
  grantedPermissions,
  clientWord,
  onGrantedPermissionsChange,
}: Readonly<TeamPermissionsSectionProps>): React.JSX.Element {
  return (
    <View style={SECTION_STYLE}>
      <Text variant="bodyStrong">{i18n.t('centerAdmin.team.permissions.title')}</Text>
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.team.permissions.helper', { clientWord })}
      </Text>
      {GRANTABLE_PERMISSIONS.map((permission) => {
        const textKey = PERMISSION_TEXT_KEYS[permission];
        const label = i18n.t(`centerAdmin.team.permissions.${textKey}Label`, { clientWord });
        return (
          <View key={permission} style={ROW_STYLE}>
            <View style={ROW_TEXT_STYLE}>
              <Text variant="body">{label}</Text>
              <Text variant="caption" color="ink2">
                {i18n.t(`centerAdmin.team.permissions.${textKey}Hint`)}
              </Text>
            </View>
            <Switch
              isOn={grantedPermissions.includes(permission)}
              accessibilityLabel={label}
              onToggle={(isOn) => {
                onGrantedPermissionsChange(togglePermission(grantedPermissions, permission, isOn));
              }}
            />
          </View>
        );
      })}
    </View>
  );
}
