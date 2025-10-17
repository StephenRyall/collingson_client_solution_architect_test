import React, { useState } from 'react';
import { FlightCard } from '../components/flight/FlightCard';
import { RecommendedTimeDisplay } from '../components/taxi/RecommendedTimeDisplay';
import { TaxiBookingWidget } from '../components/taxi/TaxiBookingWidget';
import { LoungeList } from '../components/lounge/LoungeList';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  mockFlight,
  mockRecommendedDeparture,
  mockLounges,
  mockUser,
  getLoungesByAirport,
} from '../services/api/mockData';
import './TripPlannerPage.css';

export const TripPlannerPage: React.FC = () => {
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Get lounges for departure and arrival airports
  const departureLounges = getLoungesByAirport(mockFlight.departureAirport);
  const arrivalLounges = getLoungesByAirport(mockFlight.arrivalAirport);

  const handleBookTaxi = (data: { pickupAddress: string; pickupTime: string }) => {
    console.log('Booking taxi with data:', data);
    setBookingConfirmed(true);
    
    // Reset after 3 seconds (for demo purposes)
    setTimeout(() => setBookingConfirmed(false), 3000);
  };

  return (
    <div className="trip-planner-page">
      {/* Header */}
      <header className="trip-planner-header">
        <div className="header-container">
          <div className="header-logo">
            <h1 className="logo-text">Priority Pass</h1>
            <span className="logo-badge">× Taxi Integration</span>
          </div>
          <div className="header-user">
            <div className="user-avatar">
              {mockUser.firstName.charAt(0)}{mockUser.lastName.charAt(0)}
            </div>
            <div className="user-info">
              <div className="user-name">{mockUser.firstName} {mockUser.lastName}</div>
              <div className="user-tier">{mockUser.membershipTier.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="trip-planner-main">
        <div className="content-container">
          {/* Page Title */}
          <div className="page-title-section">
            <h2 className="page-title">Your Upcoming Trip</h2>
            <p className="page-subtitle">
              Plan your journey with integrated taxi booking and lounge access
            </p>
          </div>

          {/* Success Message */}
          {bookingConfirmed && (
            <div className="success-banner">
              <span className="success-icon">✅</span>
              <div className="success-content">
                <h3 className="success-title">Taxi Booked Successfully!</h3>
                <p className="success-message">
                  Your driver will arrive at the recommended time. Check your email for confirmation.
                </p>
              </div>
            </div>
          )}

          {/* Flight Information */}
          <section className="trip-section">
            <FlightCard flight={mockFlight} />
          </section>

          {/* Recommended Departure Time */}
          <section className="trip-section">
            <RecommendedTimeDisplay recommendedDeparture={mockRecommendedDeparture} />
          </section>

          {/* Two Column Layout: Taxi Booking + Lounges */}
          <div className="trip-grid">
            {/* Taxi Booking Widget */}
            <section className="trip-section">
              <TaxiBookingWidget
                pickupAddress="123 Baker Street, London NW1 6XE"
                dropoffAddress={`${mockFlight.departureAirport} Airport, Terminal ${mockFlight.terminal}`}
                pickupTime={mockRecommendedDeparture.pickupTime}
                estimatedFare={45.00}
                discountApplied={4.50}
                onBookTaxi={handleBookTaxi}
              />
            </section>

            {/* Departure Lounges */}
            <section className="trip-section">
              <LoungeList
                lounges={departureLounges}
                title={`Lounges at ${mockFlight.departureAirport}`}
                subtitle={`Terminal ${mockFlight.terminal} - ${departureLounges.length} available`}
                compact
                maxVisible={3}
              />
            </section>
          </div>

          {/* Arrival Information */}
          <section className="trip-section">
            <Card className="arrival-info-card">
              <div className="arrival-info-header">
                <span className="arrival-icon">✨</span>
                <div className="arrival-info-content">
                  <h3 className="arrival-info-title">Upon Arrival in New York</h3>
                  <p className="arrival-info-text">
                    Relax in one of {arrivalLounges.length} premium lounges at JFK Terminal 4
                    or book your return taxi with exclusive Priority Pass member discount.
                  </p>
                </div>
              </div>
              <div className="arrival-info-actions">
                <Button variant="outline" size="small">
                  View JFK Lounges
                </Button>
                <Button variant="secondary" size="small">
                  Book Return Taxi
                </Button>
              </div>
            </Card>
          </section>

          {/* Additional Features */}
          <section className="trip-section">
            <div className="features-grid">
              <Card className="feature-card">
                <div className="feature-icon">🎫</div>
                <h4 className="feature-title">Mobile Boarding Pass</h4>
                <p className="feature-description">
                  Download your boarding pass to your device for easy check-in
                </p>
              </Card>

              <Card className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h4 className="feature-title">Travel Insurance</h4>
                <p className="feature-description">
                  Add comprehensive travel insurance for peace of mind
                </p>
              </Card>

              <Card className="feature-card">
                <div className="feature-icon">🍽️</div>
                <h4 className="feature-title">Pre-order Meals</h4>
                <p className="feature-description">
                  Reserve your preferred in-flight meal before departure
                </p>
              </Card>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="trip-planner-footer">
        <div className="footer-container">
          <div className="footer-section">
            <h4 className="footer-title">Priority Pass</h4>
            <p className="footer-text">
              Access to 1,700+ airport lounges worldwide
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Need Help?</h4>
            <p className="footer-text">
              Contact support: support@prioritypass.com
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Your Membership</h4>
            <p className="footer-text">
              {mockUser.membershipTier.replace('_', ' ')} - Since 2023
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Priority Pass. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

