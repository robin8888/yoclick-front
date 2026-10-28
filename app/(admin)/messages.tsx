import { useRouter } from 'expo-router';

import { ConversationsScreen } from '@/features/chat';
import { i18n } from '@/shared/i18n';

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
      safetyLink={{
        label: i18n.t('chat.reports.link'),
        onPress: () => {
          router.push('/(admin)/messages/reports');
        },
      }}
    />
  );
}
