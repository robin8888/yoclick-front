import { i18n } from '@/shared/i18n';

import type { CreatedCenter } from '../model/created-center-store';
import { usePickCenterLogo, type LogoPickProblem, type PickedLogo } from './usePickCenterLogo';
import { useUploadCenterLogo } from './useUploadCenterLogo';

interface CenterLogoFlow {
  pickedLogo: PickedLogo | null;
  isBusy: boolean;
  /** Fallo al preparar la imagen o al subirla; `null` si todo va bien. */
  problemMessage: string | null;
  pickLogo: () => void;
  uploadPickedLogo: () => void;
}

const PICK_PROBLEM_MESSAGE_KEYS = {
  'too-large': 'onboarding.logo.tooLarge',
  unreadable: 'onboarding.logo.unreadable',
} as const satisfies Record<LogoPickProblem, string>;

/** Elegir la imagen y subirla: un único flujo para la pantalla del logo. */
export function useCenterLogoFlow(createdCenter: CreatedCenter): CenterLogoFlow {
  const picker = usePickCenterLogo();
  const upload = useUploadCenterLogo(createdCenter.centerId);
  const pickProblemMessage =
    picker.problem === null ? null : i18n.t(PICK_PROBLEM_MESSAGE_KEYS[picker.problem]);

  return {
    pickedLogo: picker.pickedLogo,
    isBusy: picker.isPreparing || upload.isUploading,
    problemMessage: pickProblemMessage ?? upload.uploadErrorMessage,
    pickLogo: picker.pickLogo,
    uploadPickedLogo: () => {
      if (picker.pickedLogo !== null) upload.uploadLogo(picker.pickedLogo);
    },
  };
}
