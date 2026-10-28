import { useRouter } from 'expo-router';

import { ConversationsScreen } from '@/features/chat';
import { i18n } from '@/shared/i18n';

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
      safetyLink={{
        label: i18n.t('chat.blocked.link'),
        onPress: () => {
          router.push('/(staff)/messages/blocked');
        },
      }}
    />
  );
}
