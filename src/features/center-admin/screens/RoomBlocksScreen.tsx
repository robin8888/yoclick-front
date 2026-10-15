import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import type { RoomBlockListResponseDtoBlocksItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getTodayIsoDate } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { RoomBlockRow } from '../components/RoomBlockRow';
import { getDeviceTimeZone, useCenterTimeZone } from '../hooks/useCenterTimeZone';
import { useDeleteRoomBlock } from '../hooks/useDeleteRoomBlock';
import { useRoomBlocks } from '../hooks/useRoomBlocks';
import { useRoomList } from '../hooks/useRoomList';
import { buildBlockListRange } from '../model/room-block-form';
import { roomBlocksRouteParamsSchema } from '../model/room-blocks-route-params';

type RoomBlock = RoomBlockListResponseDtoBlocksItem;

interface RemoveBlockSheetProps {
  roomId: string;
  block: RoomBlock | null;
  onClose: () => void;
}

function RemoveBlockSheet({
  roomId,
  block,
  onClose,
}: Readonly<RemoveBlockSheetProps>): React.JSX.Element {
  const deletion = useDeleteRoomBlock(roomId);

  return (
    <>
      {deletion.errorMessage === null ? null : <FormErrorBanner message={deletion.errorMessage} />}
      <ConfirmSheet
        isVisible={block !== null}
        title={i18n.t('centerAdmin.roomBlocks.removeTitle')}
        message={i18n.t('centerAdmin.roomBlocks.removeMessage')}
        confirmLabel={i18n.t('centerAdmin.roomBlocks.removeConfirm')}
        dismissLabel={i18n.t('actions.cancel')}
        isConfirming={deletion.isDeleting}
        isDestructive
        onConfirm={() => {
          if (block !== null) deletion.deleteBlock(block.id, onClose);
        }}
        onDismiss={onClose}
      />
    </>
  );
}

interface BlockListProps {
  roomId: string;
  timeZone: string;
  onBlockPress: (block: RoomBlock) => void;
}

function BlockList({
  roomId,
  timeZone,
  onBlockPress,
}: Readonly<BlockListProps>): React.JSX.Element {
  const range = buildBlockListRange(getTodayIsoDate(new Date(), timeZone));
  const blocks = useRoomBlocks({ roomId, ...range });
  const blockItems = blocks.data?.blocks ?? [];

  return (
    <>
      {blocks.isError ? (
        <Text color="danger" role="alert">
          {i18n.t('centerAdmin.roomBlocks.loadError')}
        </Text>
      ) : null}
      {blocks.isSuccess && blockItems.length === 0 ? (
        <Text color="ink2">{i18n.t('centerAdmin.roomBlocks.empty')}</Text>
      ) : null}
      {blockItems.map((block) => (
        <RoomBlockRow
          key={block.id}
          block={block}
          timeZone={timeZone}
          onPress={() => {
            onBlockPress(block);
          }}
        />
      ))}
    </>
  );
}

function RoomBlocksContent({ roomId }: Readonly<{ roomId: string }>): React.JSX.Element {
  const router = useRouter();
  const room = useRoomList().data?.rooms.find((candidate) => candidate.id === roomId);
  const timeZone = useCenterTimeZone() ?? getDeviceTimeZone();
  const [blockToRemove, setBlockToRemove] = useState<RoomBlock | null>(null);

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.roomBlocks.title')}
      subtitle={i18n.t('centerAdmin.roomBlocks.subtitle', { room: room?.name ?? '' })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <Button
        isFullWidth
        leadingIconName="plus"
        label={i18n.t('centerAdmin.roomBlocks.addAction')}
        onPress={() => {
          router.push({ pathname: '/(admin)/room-blocks/new/[roomId]', params: { roomId } });
        }}
      />
      <Button
        isFullWidth
        variant="outline"
        leadingIconName="edit"
        label={i18n.t('centerAdmin.roomBlocks.editRoomAction')}
        onPress={() => {
          router.push({ pathname: '/(admin)/rooms/[roomId]', params: { roomId } });
        }}
      />
      <BlockList roomId={roomId} timeZone={timeZone} onBlockPress={setBlockToRemove} />
      <RemoveBlockSheet
        roomId={roomId}
        block={blockToRemove}
        onClose={() => {
          setBlockToRemove(null);
        }}
      />
    </ScreenTemplate>
  );
}

/** Los bloqueos de un espacio en las próximas 8 semanas: alquiler, mantenimiento o evento. */
export function RoomBlocksScreen(): React.JSX.Element {
  const params = roomBlocksRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(admin)/(tabs)/management" />;
  return <RoomBlocksContent roomId={params.data.roomId} />;
}
