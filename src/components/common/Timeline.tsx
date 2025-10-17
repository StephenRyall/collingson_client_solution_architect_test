import React from 'react';
import './Timeline.css';

export interface TimelineItem {
  time: string;
  label: string;
  icon?: string;
  highlighted?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  vertical?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ items, vertical = false }) => {
  return (
    <div className={`timeline ${vertical ? 'timeline-vertical' : 'timeline-horizontal'}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`timeline-item ${item.highlighted ? 'timeline-item-highlighted' : ''}`}
        >
          <div className="timeline-icon">
            {item.icon ? <span>{item.icon}</span> : <span className="timeline-dot"></span>}
          </div>
          <div className="timeline-content">
            <div className="timeline-time">{item.time}</div>
            <div className="timeline-label">{item.label}</div>
          </div>
          {index < items.length - 1 && <div className="timeline-connector"></div>}
        </div>
      ))}
    </div>
  );
};

