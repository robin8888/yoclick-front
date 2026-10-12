/** La marca de una sala en la agenda: su letra y el color (índice de la paleta) que la identifican. */
export interface RoomMark {
  roomId: string;
  roomName: string;
  /** «A», «B»… (y un número si hay más salas que letras). */
  letter: string;
  paletteIndex: number;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Una marca por sala, en el orden en que llegan (el del centro): la primera es la A. */
export function assignRoomMarks(rooms: readonly { id: string; name: string }[]): RoomMark[] {
  return rooms.map((room, index) => ({
    roomId: room.id,
    roomName: room.name,
    letter: LETTERS[index] ?? String(index + 1),
    paletteIndex: index,
  }));
}

export function findRoomMark(marks: readonly RoomMark[], roomId: string): RoomMark | undefined {
  return marks.find((mark) => mark.roomId === roomId);
}
