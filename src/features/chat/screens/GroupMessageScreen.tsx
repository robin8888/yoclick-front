import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { useActiveCenterSectorId } from '@/features/join';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';

import { BroadcastBody } from '../components/BroadcastBody';
import { ChatHeader } from '../components/ChatHeader';
import { MessageComposer } from '../components/MessageComposer';
import { useGroupBroadcast, type BroadcastTarget } from '../hooks/useGroupBroadcast';
import { createScreenStyle, FILL_STYLE } from './ConversationScreen.styles';

const ROUTE_PARAMS_SCHEMA = z.object({
  seriesId: z.uuid().optional(),
  className: z.string().optional(),
});

/** La clase fija con la que se llega desde «Gestión»: ya elegida, sin lista de grupos. */
function usePreselectedClass(): { target: BroadcastTarget; name: string } | null {
  const parsed = ROUTE_PARAMS_SCHEMA.safeParse(useLocalSearchParams());
  if (!parsed.success || parsed.data.seriesId === undefined) return null;
  return {
    target: { kind: 'series', seriesId: parsed.data.seriesId },
    name: parsed.data.className ?? '',
  };
}

/**
 * Escribir a todas las personas de un grupo o de una clase fija: cada una lo recibe en su
 * conversación con el centro. Tiene el mismo marco que el hilo (campo fijo pegado al teclado):
 * dentro de `ScreenTemplate` el campo quedaba tapado por el teclado.
 */
export function GroupMessageScreen(): React.JSX.Element {
  const theme = useTheme();
  const onBackPress = useBackAction();
  const clientWord = getSectorVocabulary(useActiveCenterSectorId()).client.plural;
  const broadcast = useGroupBroadcast();
  const preselected = usePreselectedClass();
  const [chosenTarget, setChosenTarget] = useState<BroadcastTarget | null>(null);
  const target = preselected?.target ?? chosenTarget;
  const title = preselected === null ? i18n.t('chat.group.title') : i18n.t('chat.group.classTitle');

  return (
    <SafeAreaView edges={['top']} style={createScreenStyle(theme)}>
      <KeyboardAvoidingView style={FILL_STYLE} behavior="padding">
        <ChatHeader name={title} photoUrl={null} iconName="users" onBackPress={onBackPress} />
        <BroadcastBody
          broadcast={broadcast}
          clientWord={clientWord}
          className={preselected?.name}
          chosenTarget={chosenTarget}
          isChoiceHidden={preselected !== null}
          onChoose={setChosenTarget}
        />
        <MessageComposer
          isBusy={broadcast.isSending}
          isSendDisabled={target === null}
          onSend={(body, onSent) => {
            if (target === null) return;
            broadcast.send({ target, body }, onSent);
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
