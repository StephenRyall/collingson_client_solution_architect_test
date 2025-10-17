import React from 'react';
import { Lounge } from '../../types';
import { Card } from '../common/Card';
import { LoungeCard } from './LoungeCard';
import './LoungeList.css';

interface LoungeListProps {
  lounges: Lounge[];
  title: string;
  subtitle?: string;
  compact?: boolean;
  maxVisible?: number;
}

export const LoungeList: React.FC<LoungeListProps> = ({
  lounges,
  title,
  subtitle,
  compact = false,
  maxVisible,
}) => {
  const [showAll, setShowAll] = React.useState(false);
  
  const visibleLounges = maxVisible && !showAll
    ? lounges.slice(0, maxVisible)
    : lounges;
  
  const hasMore = maxVisible && lounges.length > maxVisible;

  if (lounges.length === 0) {
    return (
      <Card className="lounge-list-empty">
        <div className="empty-state">
          <div className="empty-icon">🛋️</div>
          <h3 className="empty-title">No Lounges Available</h3>
          <p className="empty-message">
            There are no lounges available at this location.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="lounge-list-container">
      <div className="lounge-list-header">
        <div className="lounge-list-icon">🛋️</div>
        <div className="lounge-list-title-section">
          <h3 className="lounge-list-title">{title}</h3>
          {subtitle && <p className="lounge-list-subtitle">{subtitle}</p>}
        </div>
        <div className="lounge-list-count">
          {lounges.length} {lounges.length === 1 ? 'lounge' : 'lounges'}
        </div>
      </div>

      {compact ? (
        <div className="lounge-list-compact">
          {visibleLounges.map((lounge) => (
            <LoungeCard key={lounge.loungeId} lounge={lounge} compact />
          ))}
        </div>
      ) : (
        <div className="lounge-list-grid">
          {visibleLounges.map((lounge) => (
            <LoungeCard key={lounge.loungeId} lounge={lounge} />
          ))}
        </div>
      )}

      {hasMore && !showAll && (
        <div className="lounge-list-show-more">
          <button
            className="show-more-btn"
            onClick={() => setShowAll(true)}
          >
            Show {lounges.length - maxVisible} more {lounges.length - maxVisible === 1 ? 'lounge' : 'lounges'}
          </button>
        </div>
      )}

      {hasMore && showAll && (
        <div className="lounge-list-show-more">
          <button
            className="show-more-btn"
            onClick={() => setShowAll(false)}
          >
            Show less
          </button>
        </div>
      )}
    </div>
  );
};

