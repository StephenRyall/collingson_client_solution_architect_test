// ============================================================================
// TYPE DEFINITIONS
// Priority Pass × Taxi Integration
// ============================================================================

// ----------------------------------------------------------------------------
// User Types
// ----------------------------------------------------------------------------

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipTier: 'standard' | 'prestige' | 'prestige_plus';
  createdAt?: string;
}

// ----------------------------------------------------------------------------
// Flight Types
// ----------------------------------------------------------------------------

export interface Flight {
  flightId: string;
  userId: string;
  flightNumber: string;
  airline: string;
  departureAirport: string;  // IATA code (e.g., "LHR")
  arrivalAirport: string;     // IATA code (e.g., "JFK")
  departureTime: string;      // ISO 8601 format
  arrivalTime?: string;       // ISO 8601 format
  terminal: string;
  gate?: string;
  status: 'upcoming' | 'boarding' | 'departed' | 'arrived' | 'cancelled' | 'delayed';
}

export interface Airport {
  code: string;              // IATA code
  name: string;
  city: string;
  country: string;
}

// ----------------------------------------------------------------------------
// Taxi Booking Types
// ----------------------------------------------------------------------------

export interface TaxiBooking {
  bookingId: string;
  userId: string;
  flightId?: string;         // Optional: linked to flight
  pickupAddress: string;
  dropoffAddress: string;
  pickupTime: string;        // ISO 8601 format
  estimatedArrival: string;  // ISO 8601 format
  estimatedFare: number;
  actualFare?: number;
  discountApplied: number;
  currency: string;          // "GBP", "USD", etc.
  status: 'pending' | 'confirmed' | 'driver_assigned' | 'in_progress' | 'completed' | 'cancelled';
  driver?: TaxiDriver;
  createdAt: string;
}

export interface TaxiDriver {
  driverId: string;
  name: string;              // First name only for privacy
  vehicle: string;           // e.g., "Black Tesla Model 3"
  licensePlate: string;
  phone: string;
  rating: number;            // 0-5
  currentLocation?: {
    lat: number;
    lng: number;
  };
  estimatedArrival?: string; // e.g., "5 mins"
}

// ----------------------------------------------------------------------------
// Recommended Departure Time (Calculated)
// ----------------------------------------------------------------------------

export interface RecommendedDeparture {
  pickupTime: string;                // ISO 8601 format
  driveTimeMinutes: number;
  arrivalAtAirportTime: string;      // ISO 8601 format
  securityBufferMinutes: number;
  preparationBufferMinutes: number;
  flightDepartureTime: string;       // ISO 8601 format
  totalBufferMinutes: number;
  reasoning: string;                 // Human-readable explanation
  timeUntilPickup?: string;          // e.g., "1 hour 23 mins"
}

// ----------------------------------------------------------------------------
// Lounge Types
// ----------------------------------------------------------------------------

export interface Lounge {
  loungeId: string;
  name: string;
  airportCode: string;       // IATA code
  terminal: string;
  amenities: string[];       // e.g., ["WiFi", "Hot Food", "Showers"]
  openingHours: string;      // e.g., "05:00 - 23:00"
  description?: string;
  imageUrl?: string;
  accessType: 'included' | 'premium' | 'partner';
  membershipTiers: ('standard' | 'prestige' | 'prestige_plus')[];
}

// ----------------------------------------------------------------------------
// API Request/Response Types
// ----------------------------------------------------------------------------

export interface BookTaxiRequest {
  userId: string;
  flightId: string;
  pickupAddress: string;
  pickupTime: string;        // ISO 8601 format
  specialRequests?: string;
}

export interface BookTaxiResponse {
  success: boolean;
  bookingId?: string;
  estimatedFare?: number;
  discountApplied?: number;
  currency?: string;
  estimatedPickupTime?: string;
  message: string;
  error?: string;
}

export interface TripDetails {
  user: User;
  flight: Flight;
  recommendedDeparture: RecommendedDeparture;
  loungesAtDeparture: Lounge[];
  loungesAtArrival: Lounge[];
  existingTaxiBooking?: TaxiBooking;
}

// ----------------------------------------------------------------------------
// UI State Types
// ----------------------------------------------------------------------------

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

export interface AppState {
  user: User | null;
  currentFlight: Flight | null;
  currentBooking: TaxiBooking | null;
  loading: LoadingState;
  error: ErrorState;
}

