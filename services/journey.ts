import * as Location from 'expo-location';

export interface Stop {
  id: string;
  name: string;
  alt: number;
  status: 'complete' | 'current' | 'upcoming';
  desc: string;
  hazards: string;
}

class JourneyManager {
  private currentStopId: string = 'shi';
  private altitude: number = 2200;
  private stops: Stop[] = [];

  setStops(stops: Stop[]) {
    this.stops = stops;
  }

  setActiveStop(id: string) {
    this.currentStopId = id;
  }

  setAltitude(alt: number) {
    this.altitude = alt;
  }

  getStops() {
    return this.stops;
  }

  getJourneyContext() {
    const current = this.stops.find(s => s.id === this.currentStopId);
    const next = this.stops.find(s => s.status === 'upcoming');
    
    return `[JOURNEY CONTEXT] 
Current Altitude: ${this.altitude}m.
Current Sector: ${current?.name || 'Unknown'} (${current?.alt}m ASL).
Sector Hazard Level: ${current?.hazards || 'Unknown'}.
Next Planned Stop: ${next?.name || 'End of Route'}.
Route Progress: ${this.stops.filter(s => s.status === 'complete').length} / ${this.stops.length} sectors secured.`;
  }
}

export const journeyManager = new JourneyManager();
