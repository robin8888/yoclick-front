import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { ConversationScreen } from '@/features/chat';

const ROUTE_PARAMS_SCHEMA = z.object({ conversationId: z.uuid() });

export default function AdminConversationRoute(): React.JSX.Element | null {
  const parsed = ROUTE_PARAMS_SCHEMA.safeParse(useLocalSearchParams());
  if (!parsed.success) return null;

  return <ConversationScreen conversationId={parsed.data.conversationId} />;
}
