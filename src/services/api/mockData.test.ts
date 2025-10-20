import {
  mockFlight,
  mockLounges,
  mockRecommendedDeparture,
  mockBookTaxiResponse,
} from './mockData';

describe('mockData', () => {
  describe('mockFlight', () => {
    it('should have all required flight properties', () => {
      expect(mockFlight).toHaveProperty('flightNumber');
      expect(mockFlight).toHaveProperty('airline');
      expect(mockFlight).toHaveProperty('departureAirport');
      expect(mockFlight).toHaveProperty('arrivalAirport');
      expect(mockFlight).toHaveProperty('departureTime');
      expect(mockFlight).toHaveProperty('arrivalTime');
      expect(mockFlight).toHaveProperty('terminal');
      expect(mockFlight).toHaveProperty('gate');
      expect(mockFlight).toHaveProperty('status');
    });

    it('should have valid flight number format', () => {
      expect(mockFlight.flightNumber).toMatch(/^[A-Z]{2}\d{1,4}$/);
    });

    it('should have valid IATA airport codes', () => {
      expect(mockFlight.departureAirport).toMatch(/^[A-Z]{3}$/);
      expect(mockFlight.arrivalAirport).toMatch(/^[A-Z]{3}$/);
      expect(mockFlight.departureAirport).not.toBe(mockFlight.arrivalAirport);
    });

    it('should have valid departure and arrival times', () => {
      expect(mockFlight.departureTime).toBeDefined();
      expect(mockFlight.arrivalTime).toBeDefined();
      
      const departureTime = new Date(mockFlight.departureTime!);
      const arrivalTime = new Date(mockFlight.arrivalTime!);

      expect(departureTime.toString()).not.toBe('Invalid Date');
      expect(arrivalTime.toString()).not.toBe('Invalid Date');
      expect(arrivalTime.getTime()).toBeGreaterThan(departureTime.getTime());
    });

    it('should have valid flight status', () => {
      const validStatuses = ['upcoming', 'boarding', 'departed', 'delayed', 'cancelled'];
      expect(validStatuses).toContain(mockFlight.status);
    });

    it('should have reasonable terminal and gate values', () => {
      expect(mockFlight.terminal).toBeTruthy();
      expect(typeof mockFlight.terminal).toBe('string');
      expect(mockFlight.gate).toBeTruthy();
      expect(typeof mockFlight.gate).toBe('string');
    });
  });

  describe('mockLounges', () => {
    it('should be an array with at least one lounge', () => {
      expect(Array.isArray(mockLounges)).toBe(true);
      expect(mockLounges.length).toBeGreaterThan(0);
    });

    it('should have all required lounge properties', () => {
      mockLounges.forEach(lounge => {
        expect(lounge).toHaveProperty('loungeId');
        expect(lounge).toHaveProperty('name');
        expect(lounge).toHaveProperty('airportCode');
        expect(lounge).toHaveProperty('terminal');
        expect(lounge).toHaveProperty('openingHours');
        expect(lounge).toHaveProperty('amenities');
        expect(lounge).toHaveProperty('accessType');
        expect(lounge).toHaveProperty('membershipTiers');
      });
    });

    it('should have valid airport codes', () => {
      mockLounges.forEach(lounge => {
        expect(lounge.airportCode).toMatch(/^[A-Z]{3}$/);
      });
    });

    it('should have valid amenities array', () => {
      mockLounges.forEach(lounge => {
        expect(Array.isArray(lounge.amenities)).toBe(true);
        expect(lounge.amenities.length).toBeGreaterThan(0);
        lounge.amenities.forEach(amenity => {
          expect(typeof amenity).toBe('string');
          expect(amenity.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have valid access type', () => {
      mockLounges.forEach(lounge => {
        expect(['included', 'premium', 'partner']).toContain(lounge.accessType);
      });
    });

    it('should have valid opening hours format', () => {
      mockLounges.forEach(lounge => {
        expect(lounge.openingHours).toBeTruthy();
        expect(typeof lounge.openingHours).toBe('string');
        // Should contain time indicators
        expect(lounge.openingHours.toLowerCase()).toMatch(/\d|24|open|close/);
      });
    });

    it('should have unique lounge IDs', () => {
      const ids = mockLounges.map(lounge => lounge.loungeId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('mockRecommendedDeparture', () => {
    it('should have all required departure recommendation properties', () => {
      expect(mockRecommendedDeparture).toHaveProperty('pickupTime');
      expect(mockRecommendedDeparture).toHaveProperty('arrivalAtAirportTime');
      expect(mockRecommendedDeparture).toHaveProperty('flightDepartureTime');
      expect(mockRecommendedDeparture).toHaveProperty('securityBufferMinutes');
      expect(mockRecommendedDeparture).toHaveProperty('driveTimeMinutes');
      expect(mockRecommendedDeparture).toHaveProperty('preparationBufferMinutes');
      expect(mockRecommendedDeparture).toHaveProperty('totalBufferMinutes');
      expect(mockRecommendedDeparture).toHaveProperty('reasoning');
    });

    it('should have valid time values', () => {
      const pickupTime = new Date(mockRecommendedDeparture.pickupTime);
      const arrivalTime = new Date(mockRecommendedDeparture.arrivalAtAirportTime);
      const flightTime = new Date(mockRecommendedDeparture.flightDepartureTime);

      expect(pickupTime.toString()).not.toBe('Invalid Date');
      expect(arrivalTime.toString()).not.toBe('Invalid Date');
      expect(flightTime.toString()).not.toBe('Invalid Date');

      // Times should be in chronological order
      expect(pickupTime.getTime()).toBeLessThan(arrivalTime.getTime());
      expect(arrivalTime.getTime()).toBeLessThan(flightTime.getTime());
    });

    it('should have reasonable buffer times', () => {
      expect(mockRecommendedDeparture.securityBufferMinutes).toBeGreaterThanOrEqual(60);
      expect(mockRecommendedDeparture.securityBufferMinutes).toBeLessThanOrEqual(120);
      
      expect(mockRecommendedDeparture.driveTimeMinutes).toBeGreaterThan(0);
      expect(mockRecommendedDeparture.driveTimeMinutes).toBeLessThan(180);
      
      expect(mockRecommendedDeparture.preparationBufferMinutes).toBeGreaterThan(0);
      expect(mockRecommendedDeparture.preparationBufferMinutes).toBeLessThan(60);
    });

    it('should have correct total buffer calculation', () => {
      const expectedTotal =
        mockRecommendedDeparture.securityBufferMinutes +
        mockRecommendedDeparture.driveTimeMinutes +
        mockRecommendedDeparture.preparationBufferMinutes;

      expect(mockRecommendedDeparture.totalBufferMinutes).toBe(expectedTotal);
    });

    it('should have reasoning string', () => {
      expect(typeof mockRecommendedDeparture.reasoning).toBe('string');
      expect(mockRecommendedDeparture.reasoning.length).toBeGreaterThan(0);
      expect(mockRecommendedDeparture.reasoning).toContain('min');
    });
  });

  describe('mockBookTaxiResponse', () => {
    it('should have all required booking response properties', () => {
      expect(mockBookTaxiResponse).toHaveProperty('success');
      expect(mockBookTaxiResponse).toHaveProperty('bookingId');
      expect(mockBookTaxiResponse).toHaveProperty('message');
      expect(mockBookTaxiResponse).toHaveProperty('estimatedFare');
      expect(mockBookTaxiResponse).toHaveProperty('discountApplied');
      expect(mockBookTaxiResponse).toHaveProperty('currency');
      expect(mockBookTaxiResponse).toHaveProperty('estimatedPickupTime');
    });

    it('should have success status true', () => {
      expect(mockBookTaxiResponse.success).toBe(true);
    });

    it('should have valid booking ID format', () => {
      expect(mockBookTaxiResponse.bookingId).toBeTruthy();
      expect(typeof mockBookTaxiResponse.bookingId).toBe('string');
      expect(mockBookTaxiResponse.bookingId).toMatch(/^bkg_/);
    });

    it('should have valid fare information', () => {
      expect(mockBookTaxiResponse.estimatedFare).toBeDefined();
      expect(mockBookTaxiResponse.estimatedFare).toBeGreaterThan(0);
      expect(mockBookTaxiResponse.discountApplied).toBeDefined();
      expect(mockBookTaxiResponse.discountApplied).toBeGreaterThanOrEqual(0);
      expect(mockBookTaxiResponse.discountApplied).toBeLessThan(mockBookTaxiResponse.estimatedFare!);
    });

    it('should have valid currency code', () => {
      expect(mockBookTaxiResponse.currency).toBeTruthy();
      expect(typeof mockBookTaxiResponse.currency).toBe('string');
      expect(mockBookTaxiResponse.currency).toMatch(/^[A-Z]{3}$/);
    });

    it('should have valid estimated pickup time', () => {
      expect(mockBookTaxiResponse.estimatedPickupTime).toBeDefined();
      expect(mockBookTaxiResponse.estimatedPickupTime).toBeTruthy();
      const pickupTime = new Date(mockBookTaxiResponse.estimatedPickupTime!);
      expect(pickupTime.toString()).not.toBe('Invalid Date');
    });

    it('should have a meaningful success message', () => {
      expect(mockBookTaxiResponse.message).toBeTruthy();
      expect(typeof mockBookTaxiResponse.message).toBe('string');
      expect(mockBookTaxiResponse.message.length).toBeGreaterThan(0);
    });
  });

  describe('Data Consistency', () => {
    it('should have matching airport codes between flight and lounges', () => {
      const flightAirports = [mockFlight.departureAirport, mockFlight.arrivalAirport];
      const loungeAirports = mockLounges.map(lounge => lounge.airportCode);

      // At least one lounge should be at departure or arrival airport
      const hasMatchingLounge = loungeAirports.some(airport => 
        flightAirports.includes(airport)
      );
      expect(hasMatchingLounge).toBe(true);
    });

    it('should have recommended departure aligned with flight time', () => {
      expect(mockRecommendedDeparture.flightDepartureTime).toBe(mockFlight.departureTime);
    });

    it('should have realistic time calculations', () => {
      const pickupTime = new Date(mockRecommendedDeparture.pickupTime);
      const flightTime = new Date(mockRecommendedDeparture.flightDepartureTime);
      
      const timeDifferenceMinutes = (flightTime.getTime() - pickupTime.getTime()) / (1000 * 60);
      
      // Verify times are in correct order and difference is reasonable (2-4 hours for airport travel)
      expect(timeDifferenceMinutes).toBeGreaterThan(0);
      expect(timeDifferenceMinutes).toBeGreaterThan(120); // At least 2 hours
      expect(timeDifferenceMinutes).toBeLessThan(300); // Less than 5 hours
    });
  });
});

