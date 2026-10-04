import { Redirect, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { JoinConfirmScreen } from '@/features/join';

const joinConfirmParamsSchema = z.object({ centerId: z.uuid() });

export default function JoinConfirmRoute(): React.JSX.Element {
  const routeParams = joinConfirmParamsSchema.safeParse(useLocalSearchParams());

  // Un id que no es un UUID no puede ser un centro: se vuelve al inicio del flujo (SEC-13).
  if (!routeParams.success) return <Redirect href="/join" />;
  return <JoinConfirmScreen centerId={routeParams.data.centerId} />;
}
