import { useRouter } from 'expo-router';

import { NewConversationScreen } from '@/features/chat';

export default function StaffNewMessageRoute(): React.JSX.Element {
  const router = useRouter();

  return (
    <NewConversationScreen
      onGroupMessagePress={() => {
        router.push('/(staff)/messages/group');
      }}
      onConversationOpened={(conversationId) => {
        router.replace({
          pathname: '/(staff)/messages/[conversationId]',
          params: { conversationId },
        });
      }}
    />
  );
}
