/**
 * SPITI SHIELD TRIAGE ENGINE
 * Professional Rule-based risk assessment for high-altitude survival.
 */

export interface TriageInput {
  headache: boolean;
  nausea: boolean;
  dizziness: boolean;
  fatigue: boolean;
  spo2: number;
  altitude: number;
}

export interface TriageResult {
  risk: "LOW" | "MEDIUM" | "HIGH";
  advice: string;
  score: number;
}

export function runTriage(input: TriageInput): TriageResult {
  let score = 0;

  // Primary AMS Symptoms
  if (input.headache) score += 2;
  if (input.nausea) score += 2;
  if (input.dizziness) score += 2;
  if (input.fatigue) score += 1;

  // Physiological Indicators
  if (input.spo2 < 85) score += 5;
  else if (input.spo2 < 90) score += 4;
  else if (input.spo2 < 93) score += 2;

  // Environmental Risk
  if (input.altitude > 4000) score += 3;
  else if (input.altitude > 3000) score += 2;

  if (score >= 8) {
    return {
      score,
      risk: "HIGH",
      advice: "CRITICAL: Stop ascent immediately. Rest, seek oxygen support, and prepare SOS broadcast.",
    };
  }

  if (score >= 4) {
    return {
      score,
      risk: "MEDIUM",
      advice: "CAUTION: Rest, hydrate heavily, avoid climbing higher, and monitor symptoms hourly.",
    };
  }

  return {
    score,
    risk: "LOW",
    advice: "SAFE: Continue monitoring. Stay hydrated and avoid overexertion.",
  };
}
