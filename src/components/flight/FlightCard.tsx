import React from 'react';
import { Flight } from '../../types';
import { Card } from '../common/Card';
import { StatusBadge, getFlightStatusBadge } from '../common/StatusBadge';
import { formatDateTime, formatTime } from '../../services/utils/timeCalculations';
import './FlightCard.css';

interface FlightCardProps {
  flight: Flight;
  showFullDetails?: boolean;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, showFullDetails = true }) => {
  const statusBadge = getFlightStatusBadge(flight.status);

  return (
    <Card className="flight-card" noPadding>
      <div className="flight-card-header">
        <div className="flight-card-route">
          <div className="flight-card-airport">
            <div className="flight-card-airport-code">{flight.departureAirport}</div>
            <div className="flight-card-airport-label">Departure</div>
          </div>
          
          <div className="flight-card-arrow">
            <span className="flight-icon">✈️</span>
            <div className="flight-card-number">{flight.flightNumber}</div>
          </div>
          
          <div className="flight-card-airport">
            <div className="flight-card-airport-code">{flight.arrivalAirport}</div>
            <div className="flight-card-airport-label">Arrival</div>
          </div>
        </div>
        
        <div className="flight-card-status">
          <StatusBadge status={statusBadge.status} label={statusBadge.label} />
        </div>
      </div>

      <div className="flight-card-divider"></div>

      <div className="flight-card-details">
        <div className="flight-card-detail">
          <span className="flight-card-detail-icon">📅</span>
          <div className="flight-card-detail-content">
            <div className="flight-card-detail-label">Departure</div>
            <div className="flight-card-detail-value">{formatDateTime(flight.departureTime)}</div>
          </div>
        </div>

        {showFullDetails && (
          <>
            <div className="flight-card-detail">
              <span className="flight-card-detail-icon">🚪</span>
              <div className="flight-card-detail-content">
                <div className="flight-card-detail-label">Terminal</div>
                <div className="flight-card-detail-value">{flight.terminal}</div>
              </div>
            </div>

            {flight.gate && (
              <div className="flight-card-detail">
                <span className="flight-card-detail-icon">🚏</span>
                <div className="flight-card-detail-content">
                  <div className="flight-card-detail-label">Gate</div>
                  <div className="flight-card-detail-value">{flight.gate}</div>
                </div>
              </div>
            )}

            <div className="flight-card-detail">
              <span className="flight-card-detail-icon">🕐</span>
              <div className="flight-card-detail-content">
                <div className="flight-card-detail-label">Boarding Time</div>
                <div className="flight-card-detail-value">
                  {formatTime(new Date(new Date(flight.departureTime).getTime() - 30 * 60000))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showFullDetails && (
        <div className="flight-card-footer">
          <div className="flight-card-airline">
            <span className="flight-card-airline-icon">✈</span>
            <span>{flight.airline}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

