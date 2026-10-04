import { estimateStartingLevelIndex, type ExperienceDuration } from './starting-level';

describe('estimateStartingLevelIndex', () => {
  it.each<[ExperienceDuration, number]>([
    ['lessThanSixMonths', 0],
    ['sixToTwelveMonths', 1],
    ['oneToTwoYears', 1],
    ['moreThanTwoYears', 2],
  ])('maps %s to level index %i', (experience, expectedIndex) => {
    expect(estimateStartingLevelIndex(experience)).toBe(expectedIndex);
  });
});
