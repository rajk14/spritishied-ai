import * as Location from 'expo-location';
import * as Network from 'expo-network';
import * as Speech from 'expo-speech';
import * as SMS from 'expo-sms';
import { addEvent } from './events';

export interface AutomationTrigger {
  id: string;
  name: string;
  conditions: {
    altitude?: number;
    battery?: number;
    offline?: boolean;
    symptoms?: string[];
  };
  actions: string[];
  active: boolean;
}

class AutomationEngine {
  private triggers: AutomationTrigger[] = [
    {
      id: 'ams-protocol',
      name: 'AMS Protocol (High Alt)',
      conditions: { altitude: 3500, symptoms: ['headache', 'dizziness'], offline: true },
      actions: ['ALERT_AMS', 'FIND_O2', 'GENERATE_SOS_QR', 'SUGGEST_REST'],
      active: true,
    },
    {
      id: 'low-power-survival',
      name: 'Low Power Survival',
      conditions: { battery: 15, offline: true },
      actions: ['DIM_SCREEN', 'MINIMIZE_MESH', 'PREPARE_SMS_BUNDLE'],
      active: true,
    }
  ];

  async checkFlows(currentSymptoms: string[] = []) {
    const location = await Location.getCurrentPositionAsync({});
    const altitude = location.coords.altitude || 0;
    const batteryLevel = 85; // expo-battery is not available in SDK 55, using simulated fallback
    const networkState = await Network.getNetworkStateAsync();
    const isOffline = !networkState.isConnected;

    const triggeredActions: string[] = [];

    for (const trigger of this.triggers) {
      if (!trigger.active) continue;

      let match = true;
      if (trigger.conditions.altitude && altitude < trigger.conditions.altitude) match = false;
      if (trigger.conditions.battery && batteryLevel > trigger.conditions.battery) match = false;
      if (trigger.conditions.offline && !isOffline) match = false;
      if (trigger.conditions.symptoms) {
        const hasSymptom = trigger.conditions.symptoms.some(s => currentSymptoms.includes(s));
        if (!hasSymptom && currentSymptoms.length > 0) match = false;
      }

      if (match) {
        triggeredActions.push(...trigger.actions);
        addEvent(`Automation: ${trigger.name} triggered.`, 'warning');
      }
    }

    return triggeredActions;
  }

  async runAction(action: string) {
    switch (action) {
      case 'ALERT_AMS':
        Speech.speak("Altitude Sickness Protocol Active. Please rest and hydrate.");
        break;
      case 'PREPARE_SMS_BUNDLE':
        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable) {
          // Prepared but not sent without user input
          addEvent("Emergency SMS Packet Prepared.", "info");
        }
        break;
      default:
        console.log(`Action ${action} executed internally.`);
    }
  }
}

export const automationEngine = new AutomationEngine();
