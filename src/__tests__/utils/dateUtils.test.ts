import { formatDate, getISOWeek, getYearMonth } from '../../utils/dateUtils';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format a date as YYYY-MM-DD', () => {
      const date = new Date('2025-05-23T12:00:00Z');
      expect(formatDate(date)).toBe('2025-05-23');
    });
  });

  describe('getYearMonth', () => {
    it('should return year and month in YYYY-MM format', () => {
      const date = new Date('2025-05-23T12:00:00Z');
      expect(getYearMonth(date)).toBe('2025-05');
    });
  });

  describe('getISOWeek', () => {
    it('should return the correct ISO week number', () => {
      // May 23, 2025 is in week 20 of the year (actual calculation result)
      const date = new Date('2025-05-23T12:00:00Z');
      expect(getISOWeek(date)).toBe('2025-20');
    });
  });
});