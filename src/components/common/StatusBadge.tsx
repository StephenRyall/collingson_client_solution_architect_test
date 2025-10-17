import React from 'react';
import './StatusBadge.css';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  icon?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, icon }) => {
  return (
    <span className={`status-badge status-badge-${status}`}>
      {icon && <span className="status-badge-icon">{icon}</span>}
      <span className="status-badge-label">{label}</span>
    </span>
  );
};

// Helper function to get flight status badge
export const getFlightStatusBadge = (status: string): { status: StatusType; label: string } => {
  switch (status) {
    case 'upcoming':
      return { status: 'info', label: 'Upcoming' };
    case 'boarding':
      return { status: 'warning', label: 'Boarding' };
    case 'departed':
      return { status: 'neutral', label: 'Departed' };
    case 'arrived':
      return { status: 'success', label: 'Arrived' };
    case 'cancelled':
      return { status: 'error', label: 'Cancelled' };
    case 'delayed':
      return { status: 'warning', label: 'Delayed' };
    default:
      return { status: 'neutral', label: status };
  }
};

// Helper function to get taxi booking status badge
export const getTaxiStatusBadge = (status: string): { status: StatusType; label: string } => {
  switch (status) {
    case 'pending':
      return { status: 'info', label: 'Pending' };
    case 'confirmed':
      return { status: 'success', label: 'Confirmed' };
    case 'driver_assigned':
      return { status: 'success', label: 'Driver Assigned' };
    case 'in_progress':
      return { status: 'warning', label: 'In Progress' };
    case 'completed':
      return { status: 'success', label: 'Completed' };
    case 'cancelled':
      return { status: 'error', label: 'Cancelled' };
    default:
      return { status: 'neutral', label: status };
  }
};

