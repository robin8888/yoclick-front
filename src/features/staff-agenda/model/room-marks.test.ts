import { assignRoomMarks, findRoomMark } from './room-marks';

describe('assignRoomMarks', () => {
  it('gives each room a letter and a color in the order of the center', () => {
    const marks = assignRoomMarks([
      { id: 'room-dance', name: 'Sala de baile' },
      { id: 'room-tatami', name: 'Tatami' },
    ]);

    expect(marks).toEqual([
      { roomId: 'room-dance', roomName: 'Sala de baile', letter: 'A', paletteIndex: 0 },
      { roomId: 'room-tatami', roomName: 'Tatami', letter: 'B', paletteIndex: 1 },
    ]);
    expect(findRoomMark(marks, 'room-tatami')?.letter).toBe('B');
    expect(findRoomMark(marks, 'room-unknown')).toBeUndefined();
  });

  it('falls back to numbers after the twenty-six letters', () => {
    const rooms = Array.from({ length: 27 }, (_unused, index) => ({
      id: `room-${String(index)}`,
      name: `Sala ${String(index + 1)}`,
    }));

    const marks = assignRoomMarks(rooms);

    expect(marks[25]?.letter).toBe('Z');
    expect(marks[26]?.letter).toBe('27');
  });
});
