/**
 * SPITI SHIELD EVENT MONITOR
 * Centralized logging for real-time mesh and AI events.
 */

export interface SystemEvent {
  id: string;
  type: 'mesh' | 'ai' | 'sys' | 'emergency';
  message: string;
  timestamp: number;
}

let events: SystemEvent[] = [
  { id: 'start', type: 'sys', message: 'Shield Protocol v4.0 Initialized', timestamp: Date.now() }
];

export function addEvent(type: SystemEvent['type'], message: string) {
  const newEvent: SystemEvent = {
    id: Math.random().toString(36).substr(2, 9),
    type,
    message,
    timestamp: Date.now()
  };
  events = [newEvent, ...events].slice(0, 50); // Keep last 50
  return events;
}

export function getEvents() {
  return events;
}
