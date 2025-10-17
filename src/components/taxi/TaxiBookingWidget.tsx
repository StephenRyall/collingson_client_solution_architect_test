import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { formatCurrency, formatDateTime } from '../../services/utils/timeCalculations';
import './TaxiBookingWidget.css';

interface TaxiBookingWidgetProps {
  pickupAddress?: string;
  dropoffAddress?: string;
  pickupTime?: string;
  estimatedFare?: number;
  discountApplied?: number;
  onBookTaxi: (data: {
    pickupAddress: string;
    pickupTime: string;
  }) => void;
}

export const TaxiBookingWidget: React.FC<TaxiBookingWidgetProps> = ({
  pickupAddress = '',
  dropoffAddress = '',
  pickupTime = '',
  estimatedFare = 45.00,
  discountApplied = 4.50,
  onBookTaxi,
}) => {
  const [pickup, setPickup] = useState(pickupAddress);
  const [isLoading, setIsLoading] = useState(false);

  const handleBooking = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onBookTaxi({
      pickupAddress: pickup,
      pickupTime: pickupTime,
    });
    
    setIsLoading(false);
  };

  const originalFare = estimatedFare + discountApplied;
  const discountPercentage = ((discountApplied / originalFare) * 100).toFixed(0);

  return (
    <Card className="taxi-booking-widget">
      <div className="taxi-booking-header">
        <div className="taxi-booking-icon">🚖</div>
        <div>
          <h3 className="taxi-booking-title">Book Your Airport Taxi</h3>
          <p className="taxi-booking-subtitle">Priority Pass member discount applied</p>
        </div>
      </div>

      <div className="taxi-booking-form">
        <div className="form-group">
          <label className="form-label">
            <span className="form-label-icon">📍</span>
            Pickup Address
          </label>
          <input
            type="text"
            className="form-input"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Enter your pickup address"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="form-label-icon">🏢</span>
            Dropoff Location
          </label>
          <input
            type="text"
            className="form-input"
            value={dropoffAddress}
            disabled
            placeholder="Airport terminal"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="form-label-icon">🕐</span>
            Pickup Time
          </label>
          <div className="form-input-display">
            {pickupTime ? formatDateTime(pickupTime) : 'Not set'}
          </div>
        </div>
      </div>

      <div className="taxi-booking-pricing">
        <div className="pricing-row">
          <span className="pricing-label">Estimated Fare</span>
          <span className="pricing-value pricing-original">
            {formatCurrency(originalFare)}
          </span>
        </div>
        
        <div className="pricing-row pricing-discount">
          <span className="pricing-label">
            <span className="discount-badge">🎉 {discountPercentage}% Off</span>
            Priority Pass Discount
          </span>
          <span className="pricing-value">
            -{formatCurrency(discountApplied)}
          </span>
        </div>
        
        <div className="pricing-divider"></div>
        
        <div className="pricing-row pricing-total">
          <span className="pricing-label">Total</span>
          <span className="pricing-value">{formatCurrency(estimatedFare)}</span>
        </div>
      </div>

      <div className="taxi-booking-features">
        <div className="feature-item">
          <span className="feature-icon">✓</span>
          <span className="feature-text">Professional drivers</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">✓</span>
          <span className="feature-text">Real-time tracking</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">✓</span>
          <span className="feature-text">Fixed pricing</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">✓</span>
          <span className="feature-text">Meet & greet service</span>
        </div>
      </div>

      <Button
        variant="secondary"
        size="large"
        fullWidth
        onClick={handleBooking}
        disabled={!pickup || isLoading}
        loading={isLoading}
      >
        {isLoading ? 'Processing...' : 'Book Taxi Now'}
      </Button>

      <div className="taxi-booking-note">
        <span className="note-icon">ℹ️</span>
        <span className="note-text">
          Free cancellation up to 2 hours before pickup
        </span>
      </div>
    </Card>
  );
};

