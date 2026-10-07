import {
  buildNewRoutineRoute,
  buildRoutineDetailRoute,
  parseRoutineRouteParams,
} from './routine-routes';

describe('routine routes', () => {
  it('builds the routes of each zone', () => {
    expect(buildNewRoutineRoute('/(admin)/routines')).toBe('/(admin)/routines/new');
    expect(buildRoutineDetailRoute('/(staff)/routines', 'abc')).toBe('/(staff)/routines/abc');
  });

  it('only accepts an id that is a UUID', () => {
    const routineId = '0198f2a0-7c11-7aaa-8bbb-0123456789ab';

    expect(parseRoutineRouteParams({ routineId })).toEqual({ routineId });
    expect(parseRoutineRouteParams({ routineId: 'new' })).toBeNull();
    expect(parseRoutineRouteParams({})).toBeNull();
  });
});
