import { useRouter } from 'expo-router';

import { ConversationsScreen } from '@/features/chat';
import { i18n } from '@/shared/i18n';

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
      safetyLink={{
        label: i18n.t('chat.blocked.link'),
        onPress: () => {
          router.push('/(client)/messages/blocked');
        },
      }}
    />
  );
}
