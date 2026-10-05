import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { useForm, useWatch, type Control, type UseFormSetValue } from 'react-hook-form';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getMeListMembershipsQueryKey } from '@/shared/api/generated/endpoints/me/me';
import { onboardingCreateCenter } from '@/shared/api/generated/endpoints/onboarding/onboarding';
import type { CreateCenterRequestDto, CreateCenterResponseDto } from '@/shared/api/generated/model';
import { createIdempotencyIntention, type IdempotencyIntention } from '@/shared/api/idempotency';
import { useSessionStore } from '@/shared/auth/session-store';
import { DEFAULT_BRAND_COLOR } from '@/shared/theme';

import { useCenterCreationIntentStore } from '../model/center-creation-intent-store';
import { useCreatedCenterStore } from '../model/created-center-store';
import {
  centerDetailsFormSchema,
  type CenterDetailsFormValues,
} from '../schemas/center-details.schema';

interface CreateCenterForm {
  control: Control<CenterDetailsFormValues>;
  setValue: UseFormSetValue<CenterDetailsFormValues>;
  watchedBrandColor: string;
  watchedName: string;
  submitCenter: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

interface SubmittedCenter {
  readonly intention: IdempotencyIntention;
  readonly requestBody: CreateCenterRequestDto;
}

function mapFormValuesToRequest(details: CenterDetailsFormValues): CreateCenterRequestDto {
  const { name, sectorId, brandColor, city, isListed } = details;
  return { name, sectorId, brandColor, isListed, ...(city === '' ? {} : { city }) };
}

/**
 * Una intención del usuario = una Idempotency-Key: si el envío se repite con los mismos datos
 * (p. ej. tras perder la conexión) el servidor devuelve el mismo centro en vez de crear otro.
 */
function resolveSubmission(
  previous: SubmittedCenter | null,
  requestBody: CreateCenterRequestDto,
): SubmittedCenter {
  const isSameRequest = JSON.stringify(previous?.requestBody) === JSON.stringify(requestBody);
  if (previous !== null && isSameRequest) return previous;
  return { intention: createIdempotencyIntention(), requestBody };
}

function useEnterCreatedCenter(): (createdCenter: CreateCenterResponseDto) => Promise<void> {
  const router = useRouter();
  const queryClient = useQueryClient();
  const selectActiveCenter = useSessionStore((state) => state.selectActiveCenter);
  const saveCreatedCenter = useCreatedCenterStore((state) => state.saveCreatedCenter);
  const finishCenterCreation = useCenterCreationIntentStore((state) => state.finishCenterCreation);

  return async (createdCenter) => {
    saveCreatedCenter({
      centerId: createdCenter.centerId,
      name: createdCenter.name,
      brandColor: createdCenter.brandColor,
      joinCode: createdCenter.joinCode,
    });
    await queryClient.invalidateQueries({ queryKey: getMeListMembershipsQueryKey() });
    selectActiveCenter(createdCenter.centerId);
    finishCenterCreation();
    router.replace('/(onboarding)/logo');
  };
}

export function useCreateCenterForm(): CreateCenterForm {
  const lastSubmission = useRef<SubmittedCenter | null>(null);
  const enterCreatedCenter = useEnterCreatedCenter();
  const { control, setValue, handleSubmit } = useForm<CenterDetailsFormValues>({
    resolver: zodResolver(centerDetailsFormSchema),
    defaultValues: {
      name: '',
      sectorId: 'gym',
      city: '',
      brandColor: DEFAULT_BRAND_COLOR,
      isListed: false,
    },
  });
  const createCenterMutation = useMutation({
    mutationFn: ({ intention, requestBody }: SubmittedCenter) =>
      onboardingCreateCenter(requestBody, { headers: intention.headers }),
  });

  function submitDetails(details: CenterDetailsFormValues): void {
    const submission = resolveSubmission(lastSubmission.current, mapFormValuesToRequest(details));
    lastSubmission.current = submission;
    createCenterMutation.mutate(submission, {
      onSuccess: (createdCenter) => void enterCreatedCenter(createdCenter),
    });
  }

  return {
    control,
    setValue,
    watchedBrandColor: useWatch({ control, name: 'brandColor' }),
    watchedName: useWatch({ control, name: 'name' }),
    submitCenter: () => void handleSubmit(submitDetails)(),
    isSubmitting: createCenterMutation.isPending,
    errorMessage: createCenterMutation.isError
      ? getApiErrorMessage(createCenterMutation.error)
      : null,
  };
}
