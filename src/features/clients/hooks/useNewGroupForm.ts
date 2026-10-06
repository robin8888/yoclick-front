import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm, type Control } from 'react-hook-form';

import type { ClientLevelId } from '../model/client-display';
import {
  groupFormSchema,
  mapGroupFormToRequest,
  NO_CHOICE,
  type GroupFormValues,
} from '../model/group-form';
import { useCreateGroup } from './useClientMutations';

interface NewGroupForm {
  control: Control<GroupFormValues>;
  levelChoice: ClientLevelId | typeof NO_CHOICE;
  instructorChoice: string;
  isSaving: boolean;
  errorMessage: string | null;
  chooseLevel: (levelChoice: ClientLevelId | typeof NO_CHOICE) => void;
  chooseInstructor: (instructorChoice: string) => void;
  submit: () => void;
}

/** El formulario de un grupo nuevo: nombre con validación y nivel y responsable elegidos aparte. */
export function useNewGroupForm(): NewGroupForm {
  const router = useRouter();
  const { control, handleSubmit } = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: { name: '' },
  });
  const [levelChoice, setLevelChoice] = useState<ClientLevelId | typeof NO_CHOICE>(NO_CHOICE);
  const [instructorChoice, setInstructorChoice] = useState(NO_CHOICE);
  const creation = useCreateGroup(router.back);

  return {
    control,
    levelChoice,
    instructorChoice,
    isSaving: creation.isRunning,
    errorMessage: creation.errorMessage,
    chooseLevel: setLevelChoice,
    chooseInstructor: setInstructorChoice,
    submit: () => {
      void handleSubmit((formValues) => {
        creation.run(mapGroupFormToRequest(formValues, { levelChoice, instructorChoice }));
      })();
    },
  };
}
