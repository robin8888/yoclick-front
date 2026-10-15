import { useRouter } from 'expo-router';

import { NewConversationScreen } from '@/features/chat';

export default function AdminNewMessageRoute(): React.JSX.Element {
  const router = useRouter();

  return (
    <NewConversationScreen
      onGroupMessagePress={() => {
        router.push('/(admin)/messages/group');
      }}
      onConversationOpened={(conversationId) => {
        router.replace({
          pathname: '/(admin)/messages/[conversationId]',
          params: { conversationId },
        });
      }}
    />
  );
}
