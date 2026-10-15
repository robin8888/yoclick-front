import { useRouter } from 'expo-router';

import { ConversationsScreen } from '@/features/chat';

export default function ClientMessagesRoute(): React.JSX.Element {
  const router = useRouter();

  return (
    <ConversationsScreen
      onConversationOpen={(conversationId) => {
        router.push({
          pathname: '/(client)/messages/[conversationId]',
          params: { conversationId },
        });
      }}
      onNewConversationPress={() => {
        router.push('/(client)/messages/new');
      }}
    />
  );
}
