import {
  calculateRecommendedDeparture,
  formatTime,
  formatDuration,
} from './timeCalculations';

describe('timeCalculations', () => {
  describe('calculateRecommendedDeparture', () => {
    it('should calculate correct departure time for international flight', () => {
      const flightTime = '2024-12-20T14:30:00Z';
      const driveTime = 45; // minutes
      const isInternational = true;

      const result = calculateRecommendedDeparture(flightTime, driveTime, isInternational);

      expect(result.pickupTime).toBeDefined();
      expect(result.arrivalAtAirportTime).toBeDefined();
      expect(result.securityBufferMinutes).toBe(105); // International = 105 min
      expect(result.driveTimeMinutes).toBe(45);
      expect(result.preparationBufferMinutes).toBe(15);
      expect(result.totalBufferMinutes).toBe(165); // 105 + 45 + 15
    });

    it('should calculate correct departure time for domestic flight', () => {
      const flightTime = '2024-12-20T14:30:00Z';
      const driveTime = 30;
      const isInternational = false;

      const result = calculateRecommendedDeparture(flightTime, driveTime, isInternational);

      expect(result.securityBufferMinutes).toBe(75); // Domestic = 75 min
      expect(result.driveTimeMinutes).toBe(30);
      expect(result.preparationBufferMinutes).toBe(15);
      expect(result.totalBufferMinutes).toBe(120); // 75 + 30 + 15
    });

    it('should handle different drive times', () => {
      const flightTime = '2024-12-20T10:00:00Z';
      
      const result30min = calculateRecommendedDeparture(flightTime, 30, true);
      const result60min = calculateRecommendedDeparture(flightTime, 60, true);

      expect(result30min.driveTimeMinutes).toBe(30);
      expect(result60min.driveTimeMinutes).toBe(60);
      
      // 60min drive should have pickup 30 minutes earlier than 30min drive
      const pickup30 = new Date(result30min.pickupTime);
      const pickup60 = new Date(result60min.pickupTime);
      const timeDiff = (pickup30.getTime() - pickup60.getTime()) / (1000 * 60);
      expect(timeDiff).toBe(30);
    });

    it('should use default values when not provided', () => {
      const flightTime = '2024-12-20T14:30:00Z';
      
      const result = calculateRecommendedDeparture(flightTime);

      // Default drive time is 45 minutes
      expect(result.driveTimeMinutes).toBe(45);
      // Default is international
      expect(result.securityBufferMinutes).toBe(105);
    });

    it('should handle early morning flights correctly', () => {
      const flightTime = '2024-12-20T06:00:00Z'; // 6 AM flight
      const driveTime = 45;

      const result = calculateRecommendedDeparture(flightTime, driveTime, true);

      // Should calculate pickup time as previous day if needed
      const pickupTime = new Date(result.pickupTime);
      const flightDate = new Date(flightTime);
      
      expect(pickupTime.getTime()).toBeLessThan(flightDate.getTime());
      expect(result.totalBufferMinutes).toBe(165);
    });

    it('should return reasoning string', () => {
      const flightTime = '2024-12-20T14:30:00Z';
      const driveTime = 45;

      const result = calculateRecommendedDeparture(flightTime, driveTime, true);

      expect(result.reasoning).toBeDefined();
      expect(typeof result.reasoning).toBe('string');
      expect(result.reasoning.length).toBeGreaterThan(0);
      expect(result.reasoning).toContain(`${driveTime} min drive`);
    });

    it('should handle valid ISO date strings', () => {
      const flightTime = '2024-12-20T14:30:00.000Z';
      
      const result = calculateRecommendedDeparture(flightTime, 45, true);
      
      expect(result.pickupTime).toBeDefined();
      expect(result.flightDepartureTime).toBeDefined();
    });
  });

  describe('formatTime', () => {
    it('should format time in 12-hour format with AM/PM', () => {
      const morning = '2024-12-20T09:30:00Z';
      const afternoon = '2024-12-20T14:45:00Z';
      const midnight = '2024-12-20T00:00:00Z';
      const noon = '2024-12-20T12:00:00Z';

      const formattedMorning = formatTime(morning);
      const formattedAfternoon = formatTime(afternoon);
      const formattedMidnight = formatTime(midnight);
      const formattedNoon = formatTime(noon);

      // Should contain time and AM/PM indicator
      expect(formattedMorning).toMatch(/\d{1,2}:\d{2}/);
      expect(formattedAfternoon).toMatch(/\d{1,2}:\d{2}/);
      expect(formattedMidnight).toMatch(/\d{1,2}:\d{2}/);
      expect(formattedNoon).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should handle ISO 8601 date strings', () => {
      const isoDate = '2024-12-20T15:30:00.000Z';
      const result = formatTime(isoDate);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatDuration', () => {
    it('should format duration in minutes correctly', () => {
      expect(formatDuration(45)).toBe('45 mins');
      expect(formatDuration(1)).toBe('1 mins');
      expect(formatDuration(0)).toBe('0 mins');
    });

    it('should format duration in hours and minutes', () => {
      expect(formatDuration(60)).toBe('1 hour');
      expect(formatDuration(90)).toBe('1 hour 30 mins');
      expect(formatDuration(120)).toBe('2 hours');
      expect(formatDuration(150)).toBe('2 hours 30 mins');
    });

    it('should handle plural forms correctly', () => {
      expect(formatDuration(1)).toBe('1 mins');
      expect(formatDuration(2)).toBe('2 mins');
      expect(formatDuration(60)).toBe('1 hour');
      expect(formatDuration(120)).toBe('2 hours');
    });

    it('should handle large durations', () => {
      expect(formatDuration(300)).toBe('5 hours');
      expect(formatDuration(345)).toBe('5 hours 45 mins');
    });

    it('should handle edge cases', () => {
      expect(formatDuration(0)).toBe('0 mins');
      expect(formatDuration(59)).toBe('59 mins');
      expect(formatDuration(61)).toBe('1 hour 1 mins');
    });
  });

  describe('Integration: Full booking flow calculation', () => {
    it('should provide all necessary data for booking decision', () => {
      const flightTime = '2024-12-20T18:00:00Z'; // 6 PM flight
      const driveTime = 60; // 1 hour drive
      const isInternational = true;

      const recommendation = calculateRecommendedDeparture(flightTime, driveTime, isInternational);

      // User should get all information needed to make a booking
      expect(recommendation.pickupTime).toBeDefined();
      expect(recommendation.arrivalAtAirportTime).toBeDefined();
      expect(new Date(recommendation.flightDepartureTime).getTime()).toBe(new Date(flightTime).getTime());
      expect(recommendation.totalBufferMinutes).toBe(180); // 105 + 60 + 15

      // Verify booking data structure
      expect(recommendation).toHaveProperty('pickupTime');
      expect(recommendation).toHaveProperty('arrivalAtAirportTime');
      expect(recommendation).toHaveProperty('flightDepartureTime');
      expect(recommendation).toHaveProperty('securityBufferMinutes');
      expect(recommendation).toHaveProperty('driveTimeMinutes');
      expect(recommendation).toHaveProperty('preparationBufferMinutes');
      expect(recommendation).toHaveProperty('totalBufferMinutes');
      expect(recommendation).toHaveProperty('reasoning');
    });
  });
});

