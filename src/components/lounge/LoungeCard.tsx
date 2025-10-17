import React from 'react';
import { Lounge } from '../../types';
import { Card } from '../common/Card';
import './LoungeCard.css';

interface LoungeCardProps {
  lounge: Lounge;
  compact?: boolean;
}

export const LoungeCard: React.FC<LoungeCardProps> = ({ lounge, compact = false }) => {
  const getAccessTypeLabel = (accessType: string) => {
    switch (accessType) {
      case 'included':
        return { label: 'Included', color: '#4CAF50' };
      case 'premium':
        return { label: 'Premium', color: '#8B4789' };
      case 'partner':
        return { label: 'Partner', color: '#2196F3' };
      default:
        return { label: accessType, color: '#757575' };
    }
  };

  const accessInfo = getAccessTypeLabel(lounge.accessType);

  if (compact) {
    return (
      <div className="lounge-card-compact">
        <div className="lounge-compact-icon">🛋️</div>
        <div className="lounge-compact-content">
          <div className="lounge-compact-name">{lounge.name}</div>
          <div className="lounge-compact-details">
            Terminal {lounge.terminal} • {lounge.openingHours}
          </div>
        </div>
        <div
          className="lounge-compact-badge"
          style={{ backgroundColor: accessInfo.color }}
        >
          {accessInfo.label}
        </div>
      </div>
    );
  }

  return (
    <Card className="lounge-card" hoverable>
      <div className="lounge-card-header">
        <div className="lounge-card-icon-large">🛋️</div>
        <div
          className="lounge-card-access-badge"
          style={{ backgroundColor: accessInfo.color }}
        >
          {accessInfo.label}
        </div>
      </div>

      <h3 className="lounge-card-name">{lounge.name}</h3>

      <div className="lounge-card-location">
        <span className="lounge-location-icon">📍</span>
        <span className="lounge-location-text">
          {lounge.airportCode} - Terminal {lounge.terminal}
        </span>
      </div>

      {lounge.description && (
        <p className="lounge-card-description">{lounge.description}</p>
      )}

      <div className="lounge-card-hours">
        <span className="lounge-hours-icon">🕐</span>
        <span className="lounge-hours-text">{lounge.openingHours}</span>
      </div>

      <div className="lounge-card-amenities">
        <div className="amenities-label">Amenities:</div>
        <div className="amenities-list">
          {lounge.amenities.map((amenity, index) => (
            <span key={index} className="amenity-tag">
              {amenity}
            </span>
          ))}
        </div>
      </div>

      <div className="lounge-card-footer">
        <button className="lounge-view-details-btn">
          View Details
        </button>
      </div>
    </Card>
  );
};

