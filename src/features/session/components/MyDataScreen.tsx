import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AddressField, buildTypedAddress, getDeviceCountryCode } from '@/features/address';
import { useActiveCenterSummary } from '@/features/auth';
import { LoadErrorState } from '@/features/join';
import type { MyProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatNumericDate } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { FormField } from '@/ui/molecules/FormField';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useMyProfileData, useSaveMyData } from '../hooks/useMyData';
import {
  buildMyDataPatch,
  findMyDataProblems,
  MAX_ADDRESS_LENGTH,
  type MyDataDraft,
  type MyDataProblem,
} from '../model/my-data-form';
import { createDataCardStyle, createDataRowStyle, createSectionStyle } from './MyData.styles';

function DataRow({ label, value }: Readonly<{ label: string; value: string }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createDataRowStyle(theme)}>
      <Text variant="caption" color="ink2">
        {label}
      </Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

/** Lo que el centro ya sabe de la persona: se cambia desde su cuenta, no desde aquí. */
function CenterKnownData({
  profile,
}: Readonly<{ profile: MyProfileResponseDto }>): React.JSX.Element {
  const theme = useTheme();
  const notProvided = i18n.t('session.myData.notProvided');

  return (
    <View style={createDataCardStyle(theme)}>
      <DataRow label={i18n.t('session.myData.nameLabel')} value={profile.fullName} />
      <DataRow label={i18n.t('session.myData.emailLabel')} value={profile.email} />
      <DataRow
        label={i18n.t('session.myData.birthDateLabel')}
        value={profile.birthDate === null ? notProvided : formatNumericDate(profile.birthDate)}
      />
    </View>
  );
}

interface ContactFieldsProps {
  draft: MyDataDraft;
  problems: readonly MyDataProblem[];
  onDraftChange: (changes: Partial<MyDataDraft>) => void;
}

function ContactFields({
  draft,
  problems,
  onDraftChange,
}: Readonly<ContactFieldsProps>): React.JSX.Element {
  return (
    <>
      <FormField
        label={i18n.t('session.myData.phoneLabel')}
        helperText={i18n.t('session.myData.optionalHelper')}
        errorMessage={
          problems.includes('phone-invalid') ? i18n.t('session.myData.phoneInvalid') : undefined
        }
        value={draft.phone}
        onChangeText={(phone) => {
          onDraftChange({ phone });
        }}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <AddressField
        label={i18n.t('session.myData.addressLabel')}
        kind="address"
        countryCode={getDeviceCountryCode()}
        helperText={i18n.t('session.myData.optionalHelper')}
        errorMessage={
          problems.includes('address-too-long')
            ? i18n.t('session.myData.addressTooLong', { max: MAX_ADDRESS_LENGTH })
            : undefined
        }
        // Es el domicilio de una persona: se guarda el texto, no sus coordenadas.
        value={buildTypedAddress(draft.address)}
        onChange={(address) => {
          onDraftChange({ address: address.text });
        }}
      />
    </>
  );
}

function ContactForm({ profile }: Readonly<{ profile: MyProfileResponseDto }>): React.JSX.Element {
  const theme = useTheme();
  const [draft, setDraft] = useState<MyDataDraft>({
    phone: profile.phone ?? '',
    address: profile.address ?? '',
  });
  const saving = useSaveMyData();
  const problems = findMyDataProblems(draft);
  const patch = problems.length === 0 ? buildMyDataPatch(draft, profile) : null;

  return (
    <View style={createSectionStyle(theme)}>
      <Text variant="titleMd" role="heading">
        {i18n.t('session.myData.contactTitle')}
      </Text>
      <ContactFields
        draft={draft}
        problems={problems}
        onDraftChange={(changes) => {
          setDraft((current) => ({ ...current, ...changes }));
        }}
      />
      {saving.hasSaved && patch === null ? (
        <FormErrorBanner tone="success" message={i18n.t('session.myData.savedMessage')} />
      ) : null}
      {saving.errorMessage === null ? null : <FormErrorBanner message={saving.errorMessage} />}
      <Button
        label={i18n.t('session.myData.saveAction')}
        isFullWidth
        isLoading={saving.isSaving}
        isDisabled={patch === null}
        onPress={() => {
          if (patch !== null) saving.save(patch);
        }}
      />
    </View>
  );
}

/**
 * «Mis datos»: lo que el centro tiene de la persona y, opcionales, su teléfono y su dirección.
 * Sirve igual para el alumnado y para el equipo.
 */
export function MyDataScreen(): React.JSX.Element {
  const router = useRouter();
  const center = useActiveCenterSummary();
  const profile = useMyProfileData();

  return (
    <ScreenTemplate
      title={i18n.t('session.myData.title')}
      subtitle={i18n.t('session.myData.subtitle', { centerName: center.name })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {profile.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {profile.isError ? (
        <LoadErrorState
          title={i18n.t('session.myData.loadError')}
          error={profile.error}
          onRetry={() => void profile.refetch()}
          isRetrying={profile.isFetching}
        />
      ) : null}
      {profile.isSuccess ? (
        <>
          <CenterKnownData profile={profile.data} />
          <ContactForm profile={profile.data} />
        </>
      ) : null}
    </ScreenTemplate>
  );
}
