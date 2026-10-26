import {
  buildScheduleEditForm,
  hasScheduleChanges,
  mapScheduleEditToUpdateRequest,
  scheduleEditSchema,
} from './schedule-edit';
import type { ScheduleSeries } from './schedule-summary';

const SERIES: ScheduleSeries = {
  seriesId: 'series-1',
  label: null,
  mode: 'group',
  capacity: 12,
  status: 'active',
  startsOn: '2026-10-12',
  endsOn: null,
  service: { id: 'service-english', name: 'Inglés B1', color: null },
  staff: { membershipId: 'staff-ana', fullName: 'Ana Ruiz' },
  room: { id: 'room-2', name: 'Aula 2' },
  location: null,
  days: [
    { scheduleId: 'd-mon', weekday: 1, startsAtTime: '18:00', endsAtTime: '19:30' },
    { scheduleId: 'd-thu', weekday: 4, startsAtTime: '18:00', endsAtTime: '19:30' },
  ],
  enrolledCount: 8,
};

describe('buildScheduleEditForm', () => {
  it('fills the form from the series', () => {
    expect(buildScheduleEditForm(SERIES)).toEqual({
      label: '',
      capacity: '12',
      startsAtTime: '18:00',
      endsAtTime: '19:30',
      startsOn: '2026-10-12',
      endsOn: '',
      roomId: 'room-2',
      staffMembershipId: 'staff-ana',
      location: {
        isOutside: false,
        name: '',
        address: { text: '', latitude: null, longitude: null },
      },
    });
  });

  it('rejects an end before the start and a missing teacher', () => {
    const form = buildScheduleEditForm(SERIES);

    expect(scheduleEditSchema.safeParse({ ...form, endsAtTime: '17:00' }).success).toBe(false);
    expect(scheduleEditSchema.safeParse({ ...form, endsOn: '2026-10-01' }).success).toBe(false);
    expect(scheduleEditSchema.safeParse({ ...form, staffMembershipId: '' }).success).toBe(false);
    expect(scheduleEditSchema.safeParse(form).success).toBe(true);
  });
});

describe('mapScheduleEditToUpdateRequest', () => {
  it('sends nothing when nothing changed', () => {
    const request = mapScheduleEditToUpdateRequest(buildScheduleEditForm(SERIES), SERIES);

    expect(request).toEqual({});
    expect(hasScheduleChanges(request)).toBe(false);
  });

  it('sends the new place, or null to say the class is back in the center', () => {
    const park = { name: 'Parque', address: null, latitude: null, longitude: null };
    const formWithPark = {
      ...buildScheduleEditForm(SERIES),
      location: {
        isOutside: true,
        name: 'Parque',
        address: { text: '', latitude: null, longitude: null },
      },
    };
    const seriesInPark = { ...SERIES, location: park };

    expect(mapScheduleEditToUpdateRequest(formWithPark, SERIES)).toEqual({ location: park });
    expect(mapScheduleEditToUpdateRequest(formWithPark, seriesInPark)).toEqual({});
    expect(mapScheduleEditToUpdateRequest(buildScheduleEditForm(SERIES), seriesInPark)).toEqual({
      location: null,
    });
  });

  it('sends only the fields that changed, with null to clear the room or the end', () => {
    const request = mapScheduleEditToUpdateRequest(
      {
        ...buildScheduleEditForm(SERIES),
        label: 'Grupo de tarde',
        capacity: '10',
        endsAtTime: '20:00',
        roomId: '',
        staffMembershipId: 'staff-luis',
      },
      SERIES,
    );

    expect(request).toEqual({
      label: 'Grupo de tarde',
      capacity: 10,
      startsAtTime: '18:00',
      endsAtTime: '20:00',
      roomId: null,
      staffMembershipId: 'staff-luis',
    });
  });

  it('clears the label and sets an end date', () => {
    const labelled = { ...SERIES, label: 'Grupo de tarde', endsOn: '2026-12-20' };

    expect(
      mapScheduleEditToUpdateRequest(
        { ...buildScheduleEditForm(labelled), label: '', endsOn: '' },
        labelled,
      ),
    ).toEqual({ label: null, endsOn: null });
  });
});
