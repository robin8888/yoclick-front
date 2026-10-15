import { useRouter } from 'expo-router';

import { NewConversationScreen } from '@/features/chat';

export default function ClientNewMessageRoute(): React.JSX.Element {
  const router = useRouter();

  return (
    <NewConversationScreen
      onConversationOpened={(conversationId) => {
        router.replace({
          pathname: '/(client)/messages/[conversationId]',
          params: { conversationId },
        });
      }}
    />
  );
}
