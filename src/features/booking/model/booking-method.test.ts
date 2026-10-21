import { getBookingMethod, type BookingMethod } from './booking-method';

interface Case {
  caseName: string;
  service: Parameters<typeof getBookingMethod>[0];
  isRoomsModuleOn: boolean;
  expected: BookingMethod;
}

const CASES: readonly Case[] = [
  {
    caseName: 'a service with room schedule is booked by class',
    service: { hasSchedule: true, mode: 'group', isRental: false },
    isRoomsModuleOn: true,
    expected: 'class',
  },
  {
    caseName: 'an individual service without schedule is booked by hour',
    service: { hasSchedule: false, mode: 'private', isRental: false },
    isRoomsModuleOn: true,
    expected: 'hour',
  },
  {
    caseName: 'a group service without schedule waits for the center to set it',
    service: { hasSchedule: false, mode: 'group', isRental: false },
    isRoomsModuleOn: true,
    expected: 'unavailable',
  },
  {
    caseName: 'a service open to both modes without schedule waits too',
    service: { hasSchedule: false, mode: 'both', isRental: false },
    isRoomsModuleOn: true,
    expected: 'unavailable',
  },
  {
    caseName: 'without rooms everything the team gives is booked by hour',
    service: { hasSchedule: false, mode: 'group', isRental: false },
    isRoomsModuleOn: false,
    expected: 'hour',
  },
  {
    caseName: 'a rental without schedule is never booked by hour',
    service: { hasSchedule: false, mode: 'private', isRental: true },
    isRoomsModuleOn: false,
    expected: 'unavailable',
  },
];

describe('getBookingMethod', () => {
  it.each(CASES)('$caseName', ({ service, isRoomsModuleOn, expected }) => {
    expect(getBookingMethod(service, { isRoomsModuleOn })).toBe(expected);
  });
});
