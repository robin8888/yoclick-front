import { buildStaffHoursDraft } from './staff-hours';

describe('buildStaffHoursDraft', () => {
  it('starts from a normal working week when the person follows the center hours', () => {
    const draft = buildStaffHoursDraft(null);

    expect(draft.mon).toEqual([{ opensAt: '09:00', closesAt: '17:00' }]);
    expect(draft.fri).toEqual([{ opensAt: '09:00', closesAt: '17:00' }]);
    expect(draft.sat).toEqual([]);
    expect(draft.sun).toEqual([]);
  });

  it('uses the own hours when there are some', () => {
    const own = {
      mon: [{ opensAt: '10:00', closesAt: '12:00' }],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [{ opensAt: '09:00', closesAt: '13:00' }],
      sun: [],
    };

    const draft = buildStaffHoursDraft(own);

    expect(draft.mon).toEqual([{ opensAt: '10:00', closesAt: '12:00' }]);
    expect(draft.sat).toEqual([{ opensAt: '09:00', closesAt: '13:00' }]);
    expect(draft.fri).toEqual([]);
  });
});
