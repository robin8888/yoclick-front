import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { SignOutAction } from '@/features/session';
import { isApiError } from '@/shared/api/api-error';
import { getMeGetProfileQueryOptions } from '@/shared/api/generated/endpoints/me/me';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Logo } from '@/ui/atoms/Logo';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ActivityTab } from '../components/ActivityTab';
import { CentersTab } from '../components/CentersTab';
import { ChargesTab } from '../components/ChargesTab';
import { OverviewTab } from '../components/OverviewTab';
import { PlatformTabs } from '../components/PlatformTabs';
import { PlansTab } from '../components/PlansTab';
import { ReportsTab } from '../components/ReportsTab';
import { usePlatformChargeReport } from '../hooks/usePlatformChargeReport';
import { usePlatformOverview } from '../hooks/usePlatformOverview';
import { getCurrentMonthKey, getQuarterRange } from '../model/charge-period';

const PLATFORM_LOGO_HEIGHT = 56;

type PlatformTab = 'overview' | 'centers' | 'plans' | 'charges' | 'reports' | 'activity';
type AccountantTab = 'charges' | 'reports';

const ADMIN_TAB_OPTIONS = [
  { value: 'overview', label: i18n.t('platform.tabs.overview') },
  { value: 'centers', label: i18n.t('platform.tabs.centers') },
  { value: 'plans', label: i18n.t('platform.tabs.plans') },
  { value: 'charges', label: i18n.t('platform.tabs.charges') },
  { value: 'reports', label: i18n.t('platform.tabs.reports') },
  { value: 'activity', label: i18n.t('platform.tabs.activity') },
] as const;

const ACCOUNTANT_TAB_OPTIONS = [
  { value: 'charges', label: i18n.t('platform.tabs.charges') },
  { value: 'reports', label: i18n.t('platform.tabs.reports') },
] as const;

function AdministrationTabs({
  tab,
  onCenterOpen,
}: Readonly<{ tab: PlatformTab; onCenterOpen: (centerId: string) => void }>): React.JSX.Element {
  if (tab === 'centers') return <CentersTab onCenterOpen={onCenterOpen} />;
  if (tab === 'plans') return <PlansTab />;
  if (tab === 'charges') return <ChargesTab isReadOnly={false} />;
  if (tab === 'reports') return <ReportsTab />;
  if (tab === 'activity') return <ActivityTab onCenterOpen={onCenterOpen} />;
  return <OverviewTab />;
}

/** Sin segundo factor la API no da paso: se explica y se lleva a activarlo, en vez de un error seco. */
function SecondFactorNotice(): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      <Text variant="titleMd">{i18n.t('platform.mfa.title')}</Text>
      <Text color="ink2">{i18n.t('platform.mfa.message')}</Text>
      <Button
        label={i18n.t('platform.mfa.action')}
        isFullWidth
        onPress={() => {
          router.push('/(platform)/mfa-setup');
        }}
      />
    </>
  );
}

function isSecondFactorError(error: unknown): boolean {
  return isApiError(error) && error.code === 'MFA_REQUIRED';
}

function AdministrationHome(): React.JSX.Element {
  const router = useRouter();
  const [tab, setTab] = useState<PlatformTab>('overview');
  const overview = usePlatformOverview();

  if (isSecondFactorError(overview.error)) return <SecondFactorNotice />;
  return (
    <>
      <PlatformTabs options={ADMIN_TAB_OPTIONS} selectedValue={tab} onValueChange={setTab} />
      <AdministrationTabs
        tab={tab}
        onCenterOpen={(centerId) => {
          router.push({ pathname: '/(platform)/center/[centerId]', params: { centerId } });
        }}
      />
    </>
  );
}

/** El gestor lee los cobros y los informes, nada más. La API es la que le impide cambiar algo. */
function AccountantHome(): React.JSX.Element {
  const [tab, setTab] = useState<AccountantTab>('reports');
  const quarterReport = usePlatformChargeReport(getQuarterRange(getCurrentMonthKey(new Date())));

  if (isSecondFactorError(quarterReport.error)) return <SecondFactorNotice />;
  return (
    <>
      <PlatformTabs options={ACCOUNTANT_TAB_OPTIONS} selectedValue={tab} onValueChange={setTab} />
      {tab === 'charges' ? <ChargesTab isReadOnly /> : <ReportsTab />}
    </>
  );
}

/** Quién entra decide qué ve: el `admin` toda la administración y el gestor, los cobros e informes. */
function PlatformHomeContent({
  platformRole,
}: Readonly<{ platformRole: 'none' | 'admin' | 'accountant' }>): React.JSX.Element | null {
  if (platformRole === 'admin') return <AdministrationHome />;
  if (platformRole === 'accountant') return <AccountantHome />;
  return null;
}

/**
 * Inicio de la zona «Plataforma» (docs/spec/17): resumen, centros, planes, cobros, informes y actividad
 * para el usuario `admin`. El usuario de solo lectura del gestor entra aquí también, pero solo ve los
 * cobros y los informes. Es solo usabilidad: la API decide quién puede qué.
 */
export function PlatformHomeScreen(): React.JSX.Element {
  const signOut = useSignOutFlow();
  const profile = useQuery(getMeGetProfileQueryOptions());

  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      headerAccessory={<Logo variant="lockup" height={PLATFORM_LOGO_HEIGHT} />}
      title={i18n.t('platform.title')}
      subtitle={i18n.t('platform.subtitle')}
      isLoading={signOut.isSigningOut}
    >
      {profile.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : (
        <PlatformHomeContent platformRole={profile.data?.platformRole ?? 'none'} />
      )}
      <SignOutAction flow={signOut} />
    </ScreenTemplate>
  );
}
