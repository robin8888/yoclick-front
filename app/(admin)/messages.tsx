import { useRouter } from 'expo-router';

import { ConversationsScreen } from '@/features/chat';

export default function AdminMessagesRoute(): React.JSX.Element {
  const router = useRouter();

  return (
    <ConversationsScreen
      onConversationOpen={(conversationId) => {
        router.push({ pathname: '/(admin)/messages/[conversationId]', params: { conversationId } });
      }}
      onNewConversationPress={() => {
        router.push('/(admin)/messages/new');
      }}
    />
  );
}
