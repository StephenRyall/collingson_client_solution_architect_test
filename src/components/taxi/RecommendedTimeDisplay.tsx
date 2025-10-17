import React from 'react';
import { RecommendedDeparture } from '../../types';
import { Card } from '../common/Card';
import { Timeline, TimelineItem } from '../common/Timeline';
import { formatTime, formatDuration } from '../../services/utils/timeCalculations';
import './RecommendedTimeDisplay.css';

interface RecommendedTimeDisplayProps {
  recommendedDeparture: RecommendedDeparture;
}

export const RecommendedTimeDisplay: React.FC<RecommendedTimeDisplayProps> = ({
  recommendedDeparture,
}) => {
  const timelineItems: TimelineItem[] = [
    {
      time: formatTime(recommendedDeparture.pickupTime),
      label: 'Taxi Pickup',
      icon: '🚖',
      highlighted: true,
    },
    {
      time: formatTime(recommendedDeparture.arrivalAtAirportTime),
      label: `Arrive at Airport (${formatDuration(recommendedDeparture.driveTimeMinutes)} drive)`,
      icon: '🏢',
    },
    {
      time: formatTime(new Date(new Date(recommendedDeparture.flightDepartureTime).getTime() - recommendedDeparture.securityBufferMinutes * 60000)),
      label: `Security & Check-in (${formatDuration(recommendedDeparture.securityBufferMinutes)} buffer)`,
      icon: '🛂',
    },
    {
      time: formatTime(recommendedDeparture.flightDepartureTime),
      label: 'Flight Departure',
      icon: '✈️',
    },
  ];

  return (
    <Card className="recommended-time-card">
      <div className="recommended-time-header">
        <div className="recommended-time-icon">🚖</div>
        <div className="recommended-time-title-section">
          <h3 className="recommended-time-title">Recommended Taxi Departure</h3>
          <p className="recommended-time-subtitle">{recommendedDeparture.reasoning}</p>
        </div>
      </div>

      <div className="recommended-time-timeline">
        <Timeline items={timelineItems} />
      </div>

      {recommendedDeparture.timeUntilPickup && (
        <div className="recommended-time-countdown">
          <div className="countdown-icon">⏰</div>
          <div className="countdown-text">
            <span className="countdown-label">Book taxi for departure</span>
            <span className="countdown-value">{recommendedDeparture.timeUntilPickup}</span>
          </div>
        </div>
      )}

      <div className="recommended-time-breakdown">
        <div className="time-breakdown-item">
          <div className="time-breakdown-icon">🚗</div>
          <div className="time-breakdown-content">
            <div className="time-breakdown-value">{formatDuration(recommendedDeparture.driveTimeMinutes)}</div>
            <div className="time-breakdown-label">Drive Time</div>
          </div>
        </div>
        
        <div className="time-breakdown-item">
          <div className="time-breakdown-icon">🛃</div>
          <div className="time-breakdown-content">
            <div className="time-breakdown-value">{formatDuration(recommendedDeparture.securityBufferMinutes)}</div>
            <div className="time-breakdown-label">Security Buffer</div>
          </div>
        </div>
        
        <div className="time-breakdown-item">
          <div className="time-breakdown-icon">🧳</div>
          <div className="time-breakdown-content">
            <div className="time-breakdown-value">{formatDuration(recommendedDeparture.preparationBufferMinutes)}</div>
            <div className="time-breakdown-label">Preparation</div>
          </div>
        </div>
        
        <div className="time-breakdown-item time-breakdown-total">
          <div className="time-breakdown-icon">⏱️</div>
          <div className="time-breakdown-content">
            <div className="time-breakdown-value">{formatDuration(recommendedDeparture.totalBufferMinutes)}</div>
            <div className="time-breakdown-label">Total Buffer</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

