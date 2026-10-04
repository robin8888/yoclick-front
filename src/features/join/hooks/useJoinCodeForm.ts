import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm, type Control } from 'react-hook-form';

import { joinCodeFormSchema, type JoinCodeFormValues } from '../schemas/join-code.schema';
import { useFindCenterByJoinCode } from './useFindCenterByJoinCode';

interface JoinCodeForm {
  control: Control<JoinCodeFormValues>;
  submitJoinCode: () => void;
  isSearching: boolean;
  searchError: unknown;
}

/** Formulario del código: al encontrar el centro pasa a confirmarlo. */
export function useJoinCodeForm(): JoinCodeForm {
  const router = useRouter();
  const findCenter = useFindCenterByJoinCode();
  const { control, handleSubmit } = useForm<JoinCodeFormValues>({
    resolver: zodResolver(joinCodeFormSchema),
    defaultValues: { joinCode: '' },
  });

  const submitJoinCode = handleSubmit(({ joinCode }) => {
    findCenter.mutate(joinCode, {
      onSuccess: (center) => {
        router.push(`/join/${center.id}`);
      },
    });
  });

  return {
    control,
    submitJoinCode: () => void submitJoinCode(),
    isSearching: findCenter.isPending,
    searchError: findCenter.error,
  };
}
