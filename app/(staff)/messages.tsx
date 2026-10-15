import { useRouter } from 'expo-router';

import { ConversationsScreen } from '@/features/chat';

export default function StaffMessagesRoute(): React.JSX.Element {
  const router = useRouter();

  return (
    <ConversationsScreen
      onConversationOpen={(conversationId) => {
        router.push({ pathname: '/(staff)/messages/[conversationId]', params: { conversationId } });
      }}
      onNewConversationPress={() => {
        router.push('/(staff)/messages/new');
      }}
    />
  );
}
