import { useRouter } from 'expo-router';

import { NewConversationScreen } from '@/features/chat';

export default function StaffNewMessageRoute(): React.JSX.Element {
  const router = useRouter();

  return (
    <NewConversationScreen
      onConversationOpened={(conversationId) => {
        router.replace({
          pathname: '/(staff)/messages/[conversationId]',
          params: { conversationId },
        });
      }}
    />
  );
}
