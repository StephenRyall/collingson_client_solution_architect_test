// ============================================================================
// TIME CALCULATION UTILITIES
// Business logic for calculating recommended taxi departure times
// ============================================================================

import { RecommendedDeparture } from '../../types';

/**
 * Calculate recommended taxi pickup time based on flight details
 * This replicates the backend Integration Service logic
 */
export const calculateRecommendedDeparture = (
  flightDepartureTime: string,
  driveTimeMinutes: number = 45,
  isInternational: boolean = true
): RecommendedDeparture => {
  const flightTime = new Date(flightDepartureTime);
  
  // Security buffer depends on flight type
  const securityBufferMinutes = isInternational ? 105 : 75; // 105 for international, 75 for domestic
  const preparationBufferMinutes = 15; // Time to get ready, load luggage, etc.
  
  const totalBufferMinutes = driveTimeMinutes + securityBufferMinutes + preparationBufferMinutes;
  
  // Calculate pickup time by subtracting total buffer from flight time
  const pickupTime = new Date(flightTime.getTime() - totalBufferMinutes * 60000);
  
  // Calculate airport arrival time
  const arrivalTime = new Date(pickupTime.getTime() + driveTimeMinutes * 60000);
  
  // Calculate time until pickup (if in future)
  const now = new Date();
  const timeUntilPickup = pickupTime.getTime() - now.getTime();
  const timeUntilPickupStr = timeUntilPickup > 0 
    ? formatDuration(Math.floor(timeUntilPickup / 60000))
    : 'Past due';
  
  return {
    pickupTime: pickupTime.toISOString(),
    driveTimeMinutes,
    arrivalAtAirportTime: arrivalTime.toISOString(),
    securityBufferMinutes,
    preparationBufferMinutes,
    flightDepartureTime: flightTime.toISOString(),
    totalBufferMinutes,
    reasoning: `Recommended pickup at ${formatTime(pickupTime)}: ${driveTimeMinutes} min drive + ${preparationBufferMinutes} min preparation + ${securityBufferMinutes} min security/check-in buffer`,
    timeUntilPickup: timeUntilPickupStr,
  };
};

/**
 * Format time to human-readable format (e.g., "2:30 PM")
 */
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format date to human-readable format (e.g., "Mon, Oct 20")
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date and time together (e.g., "Mon, Oct 20 at 2:30 PM")
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d)} at ${formatTime(d)}`;
};

/**
 * Format duration in minutes to human-readable (e.g., "1 hour 23 mins")
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${mins} mins`;
};

/**
 * Calculate time difference between two dates in minutes
 */
export const getMinutesDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return Math.floor((d2.getTime() - d1.getTime()) / 60000);
};

/**
 * Check if a time is in the past
 */
export const isPast = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
};

/**
 * Check if a time is within the next N minutes
 */
export const isWithinMinutes = (date: Date | string, minutes: number): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const threshold = Date.now() + minutes * 60000;
  return d.getTime() <= threshold && d.getTime() >= Date.now();
};

/**
 * Get time remaining until a specific time (e.g., "in 2 hours 15 mins")
 */
export const getTimeRemaining = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = Date.now();
  const diff = d.getTime() - now;
  
  if (diff < 0) {
    return 'Past due';
  }
  
  const minutes = Math.floor(diff / 60000);
  return `in ${formatDuration(minutes)}`;
};

/**
 * Format currency (e.g., 45.50 -> "£45.50")
 */
export const formatCurrency = (amount: number, currency: string = 'GBP'): string => {
  const symbols: { [key: string]: string } = {
    GBP: '£',
    USD: '$',
    EUR: '€',
  };
  
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
};

/**
 * Get relative time (e.g., "2 hours ago", "in 5 minutes")
 */
export const getRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = Date.now();
  const diff = Math.abs(d.getTime() - now);
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) {
    return 'Just now';
  }
  
  if (minutes < 60) {
    return d.getTime() > now 
      ? `in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
      : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return d.getTime() > now
      ? `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`
      : `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const days = Math.floor(hours / 24);
  return d.getTime() > now
    ? `in ${days} ${days === 1 ? 'day' : 'days'}`
    : `${days} ${days === 1 ? 'day' : 'days'} ago`;
};

