/**
 * TinyBrain Simulation
 * This provides high-quality heuristic answers for common general queries 
 * when the app is 100% offline and no local LLM server is available.
 */

const KNOWLEDGE: Record<string, string> = {
  "hello": "Hello! I am your SpitiShield offline companion. How can I assist you in the valley today?",
  "hi": "Greetings. I'm active on the local mesh. Need survival data or resource locations?",
  "who are you": "I am SpitiShield AI, an Edge-computing assistant designed for the Spiti Valley. I can operate 100% offline to provide medical, route, and survival data.",
  "help": "I can help with: \n1. AMS Triage and treatment.\n2. Finding Oxygen/Fuel in Kaza.\n3. Weather alerts.\n4. Emergency SOS broadcasting.",
  "thank you": "You're welcome. Stay safe and keep your hydration levels high at this altitude.",
  "thanks": "Stay safe. Remember to monitor your heart rate and oxygen levels regularly.",
  "kaza": "Kaza is the sub-divisional headquarters of Spiti. Altitude is 3,800m. It has the only petrol pump and major hospital in the region.",
  "manali": "The road to Manali via Kunzum Pass is 201km. It is extremely high altitude and prone to sudden snow. Check local mesh for pass status.",
  "weather": "Current data suggests a cold desert climate. Temperatures drop sharply after sunset. Carry thermal layers even in summer.",
  "oxygen": "Oxygen is available at Kaza General Hospital and Losar Checkpost. If you feel breathless, do not climb higher.",
  "sos": "Hold the SOS button in the navigation bar to broadcast a distress signal on the local 433MHz mesh frequency.",
};

export function getTinyBrainResponse(query: string): string | null {
  const low = query.toLowerCase();
  
  // Direct matches
  for (const [key, value] of Object.entries(KNOWLEDGE)) {
    if (low.includes(key)) return value;
  }

  // Heuristic patterns
  if (low.includes("where") && low.includes("petrol")) return KNOWLEDGE["fuel"] || "The only petrol pump is in Kaza (Indian Oil).";
  if (low.includes("how") && low.includes("feel")) return "Are you feeling nauseous or having a headache? You might have AMS. Check the Triage screen.";
  if (low.includes("eat") || low.includes("food")) return "Kaza market has several cafes. High carb intake is recommended for altitude acclimation.";
  
  return null;
}
