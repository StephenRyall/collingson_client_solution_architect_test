// ============================================================================
// MOCK DATA
// Priority Pass × Taxi Integration
// For demonstration and testing purposes
// ============================================================================

import {
  User,
  Flight,
  Lounge,
  RecommendedDeparture,
  TaxiBooking,
  BookTaxiResponse,
} from '../../types';

// ----------------------------------------------------------------------------
// Mock User
// ----------------------------------------------------------------------------

export const mockUser: User = {
  userId: 'user_pp_001',
  email: 'john.smith@example.com',
  firstName: 'John',
  lastName: 'Smith',
  membershipTier: 'prestige',
  createdAt: '2023-01-15T10:00:00Z',
};

// ----------------------------------------------------------------------------
// Mock Flight
// ----------------------------------------------------------------------------

export const mockFlight: Flight = {
  flightId: 'flt_001',
  userId: 'user_pp_001',
  flightNumber: 'BA281',
  airline: 'British Airways',
  departureAirport: 'LHR',
  arrivalAirport: 'JFK',
  departureTime: '2025-10-20T14:30:00Z',
  arrivalTime: '2025-10-20T17:45:00Z',
  terminal: '5',
  gate: 'A22',
  status: 'upcoming',
};

export const mockFlightReturn: Flight = {
  flightId: 'flt_002',
  userId: 'user_pp_001',
  flightNumber: 'BA112',
  airline: 'British Airways',
  departureAirport: 'JFK',
  arrivalAirport: 'LHR',
  departureTime: '2025-10-25T20:30:00Z',
  arrivalTime: '2025-10-26T08:45:00Z',
  terminal: '7',
  gate: 'B12',
  status: 'upcoming',
};

// ----------------------------------------------------------------------------
// Mock Lounges
// ----------------------------------------------------------------------------

export const mockLounges: Lounge[] = [
  {
    loungeId: 'lng_001',
    name: 'British Airways Galleries Lounge',
    airportCode: 'LHR',
    terminal: '5',
    amenities: ['WiFi', 'Hot Food', 'Showers', 'Business Center', 'Bar'],
    openingHours: '05:00 - 23:00',
    description: 'Premium lounge with full dining service and shower facilities.',
    accessType: 'included',
    membershipTiers: ['standard', 'prestige', 'prestige_plus'],
  },
  {
    loungeId: 'lng_002',
    name: 'No1 Lounge Heathrow Terminal 5',
    airportCode: 'LHR',
    terminal: '5',
    amenities: ['WiFi', 'Hot Food', 'Premium Bar', 'Spa Services'],
    openingHours: '05:30 - 22:00',
    description: 'Luxury lounge with spa treatments and premium dining.',
    accessType: 'premium',
    membershipTiers: ['prestige', 'prestige_plus'],
  },
  {
    loungeId: 'lng_003',
    name: 'Plaza Premium Lounge',
    airportCode: 'LHR',
    terminal: '5',
    amenities: ['WiFi', 'Light Snacks', 'Beverages', 'Newspapers'],
    openingHours: '06:00 - 22:00',
    description: 'Comfortable lounge with light refreshments.',
    accessType: 'included',
    membershipTiers: ['standard', 'prestige', 'prestige_plus'],
  },
  {
    loungeId: 'lng_004',
    name: 'American Express Lounge',
    airportCode: 'JFK',
    terminal: '4',
    amenities: ['WiFi', 'Premium Dining', 'Spa Services', 'Showers', 'Conference Rooms'],
    openingHours: '06:00 - 22:00',
    description: 'Award-winning lounge with exceptional dining and amenities.',
    accessType: 'included',
    membershipTiers: ['prestige', 'prestige_plus'],
  },
  {
    loungeId: 'lng_005',
    name: 'Delta Sky Club',
    airportCode: 'JFK',
    terminal: '4',
    amenities: ['WiFi', 'Hot Food', 'Bar', 'Business Center'],
    openingHours: '05:00 - 23:00',
    description: 'Modern lounge with full service bar and dining.',
    accessType: 'partner',
    membershipTiers: ['prestige', 'prestige_plus'],
  },
  {
    loungeId: 'lng_006',
    name: 'Lufthansa Business Lounge',
    airportCode: 'JFK',
    terminal: '1',
    amenities: ['WiFi', 'Hot Food', 'Beverages', 'Workstations'],
    openingHours: '06:00 - 22:00',
    description: 'Professional lounge with business facilities.',
    accessType: 'included',
    membershipTiers: ['standard', 'prestige', 'prestige_plus'],
  },
];

// ----------------------------------------------------------------------------
// Mock Recommended Departure Time
// ----------------------------------------------------------------------------

export const mockRecommendedDeparture: RecommendedDeparture = {
  pickupTime: '2025-10-20T11:00:00Z',
  driveTimeMinutes: 45,
  arrivalAtAirportTime: '2025-10-20T11:45:00Z',
  securityBufferMinutes: 105,       // 1 hour 45 mins for international
  preparationBufferMinutes: 15,
  flightDepartureTime: '2025-10-20T14:30:00Z',
  totalBufferMinutes: 165,          // 45 drive + 105 security + 15 prep
  reasoning: 'Recommended pickup at 11:00 AM: 45 min drive + 15 min preparation + 105 min security/check-in buffer for international flight',
  timeUntilPickup: '2 hours 15 mins',
};

// ----------------------------------------------------------------------------
// Mock Taxi Booking
// ----------------------------------------------------------------------------

export const mockTaxiBooking: TaxiBooking = {
  bookingId: 'bkg_456',
  userId: 'user_pp_001',
  flightId: 'flt_001',
  pickupAddress: '123 Baker Street, London NW1 6XE',
  dropoffAddress: 'Heathrow Airport, Terminal 5, London TW6 2GA',
  pickupTime: '2025-10-20T11:00:00Z',
  estimatedArrival: '2025-10-20T11:45:00Z',
  estimatedFare: 45.00,
  actualFare: 45.00,
  discountApplied: 4.50,  // 10% PP member discount
  currency: 'GBP',
  status: 'driver_assigned',
  driver: {
    driverId: 'drv_789',
    name: 'Michael',
    vehicle: 'Black Tesla Model 3',
    licensePlate: 'LX23 ABC',
    phone: '+44 7700 900123',
    rating: 4.8,
    currentLocation: {
      lat: 51.5074,
      lng: -0.1278,
    },
    estimatedArrival: '5 mins',
  },
  createdAt: '2025-10-20T08:30:00Z',
};

// ----------------------------------------------------------------------------
// Mock API Response for Taxi Booking
// ----------------------------------------------------------------------------

export const mockBookTaxiResponse: BookTaxiResponse = {
  success: true,
  bookingId: 'bkg_456',
  estimatedFare: 45.00,
  discountApplied: 4.50,
  currency: 'GBP',
  estimatedPickupTime: '2025-10-20T11:00:00Z',
  message: 'Taxi booked successfully! Your driver will arrive at 10:55 AM.',
};

// ----------------------------------------------------------------------------
// Helper Functions to Get Mock Data
// ----------------------------------------------------------------------------

export const getLoungesByAirport = (airportCode: string): Lounge[] => {
  return mockLounges.filter(lounge => lounge.airportCode === airportCode);
};

export const getLoungesByAirportAndTerminal = (
  airportCode: string,
  terminal: string
): Lounge[] => {
  return mockLounges.filter(
    lounge => lounge.airportCode === airportCode && lounge.terminal === terminal
  );
};

export const getAccessibleLounges = (
  airportCode: string,
  membershipTier: 'standard' | 'prestige' | 'prestige_plus'
): Lounge[] => {
  return mockLounges.filter(
    lounge =>
      lounge.airportCode === airportCode &&
      lounge.membershipTiers.includes(membershipTier)
  );
};

// ----------------------------------------------------------------------------
// Mock API Delay (Simulate Network Latency)
// ----------------------------------------------------------------------------

export const mockApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

