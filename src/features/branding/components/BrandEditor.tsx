import { useActiveCenterSummary } from '@/features/auth';
import type { PickCenterLogo } from '@/features/onboarding';
import { i18n } from '@/shared/i18n';
import { normalizeHexColor } from '@/shared/theme/brand-engine';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { FormField } from '@/ui/molecules/FormField';

import type { BrandDraftState } from '../hooks/useBrandDraft';
import type { PublishBrand } from '../hooks/usePublishBrand';
import { buildBrandContrastReport } from '../model/brand-contrast-report';
import { MAX_CENTER_NAME_LENGTH, type BrandDraft } from '../model/brand-draft';
import { BrandLogoCard } from './BrandLogoCard';
import { BrandPreviewPanel } from './BrandPreviewPanel';
import { BrandSwatchPicker } from './BrandSwatchPicker';
import { ContrastReportCard } from './ContrastReportCard';
import { ServicesAndTeamLink } from './ServicesAndTeamLink';

interface BrandEditorProps {
  brand: BrandDraftState;
  draft: BrandDraft;
  logoPicker: PickCenterLogo;
  publication: PublishBrand;
  currentLogoUrl: string | null;
}

const LOGO_PROBLEM_MESSAGE_KEYS = {
  'too-large': 'onboarding.logo.tooLarge',
  unreadable: 'onboarding.logo.unreadable',
} as const;

function PublicationNotices({
  publication,
}: Readonly<{ publication: PublishBrand }>): React.JSX.Element {
  return (
    <>
      {publication.hasPublished ? (
        <FormErrorBanner tone="success" message={i18n.t('branding.publishedMessage')} />
      ) : null}
      {publication.errorMessage === null ? null : (
        <FormErrorBanner message={publication.errorMessage} />
      )}
    </>
  );
}

function BrandNameField({
  brand,
  name,
}: Readonly<{ brand: BrandDraftState; name: string }>): React.JSX.Element {
  const hasNameProblem = brand.problems.some((problem) => problem.startsWith('name'));

  return (
    <FormField
      label={i18n.t('branding.name.label')}
      value={name}
      onChangeText={brand.changeName}
      errorMessage={hasNameProblem ? i18n.t('branding.name.invalid') : undefined}
      maxLength={MAX_CENTER_NAME_LENGTH}
    />
  );
}

/** Mientras se escribe un color a medias, la vista previa conserva el último color válido. */
function resolvePreviewColor(draft: BrandDraft, published: BrandDraft | null): string {
  return normalizeHexColor(draft.color) ?? published?.color ?? draft.color;
}

function findLogoProblemMessage(problem: PickCenterLogo['problem']): string | null {
  return problem === null ? null : i18n.t(LOGO_PROBLEM_MESSAGE_KEYS[problem]);
}

/** El formulario de marca: vista previa, logo, color, contraste, nombre y accesos. */
export function BrandEditor({
  brand,
  draft,
  logoPicker,
  publication,
  currentLogoUrl,
}: Readonly<BrandEditorProps>): React.JSX.Element {
  const center = useActiveCenterSummary();
  const previewColor = resolvePreviewColor(draft, brand.published);

  return (
    <>
      <BrandPreviewPanel
        centerName={draft.name.trim() === '' ? center.name : draft.name}
        centerLogoUrl={currentLogoUrl}
        brandHexColor={previewColor}
      />
      <BrandLogoCard
        centerName={draft.name}
        currentLogoUrl={currentLogoUrl}
        pendingLogoUri={logoPicker.pickedLogo?.previewUri ?? null}
        isPreparing={logoPicker.isPreparing}
        problemMessage={findLogoProblemMessage(logoPicker.problem)}
        onLogoPickPress={logoPicker.pickLogo}
      />
      <BrandSwatchPicker
        selectedColor={draft.color}
        hasColorProblem={brand.problems.includes('color-invalid')}
        onColorChange={brand.changeColor}
      />
      <ContrastReportCard report={buildBrandContrastReport(previewColor)} />
      <BrandNameField brand={brand} name={draft.name} />
      <ServicesAndTeamLink />
      <PublicationNotices publication={publication} />
    </>
  );
}
