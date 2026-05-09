export const SURVIVAL_GUIDE = `
# SPITI SURVIVAL KNOWLEDGE BASE
VERSION: 2.0 (OFFLINE ENHANCED)

## ACUTE MOUNTAIN SICKNESS (AMS) / ALTITUDE
AMS is caused by rapid ascent to altitudes above 2,500m. 
Symptoms: Headache, nausea, dizziness, fatigue, loss of appetite, sleep disturbance.
Protocol: 
1. STOP ASCENT immediately. 
2. Hydrate (4-5 liters of water per day). 
3. If symptoms persist for 12+ hours or worsen (HAPE/HACE), DESCEND 500-1,000m immediately.
4. Medications: Acetazolamide (Diamox) 250mg twice daily (requires prescription).
5. Warning: Alcohol and sedatives increase risk.

## KAZA REGION / TOWN DATA
Altitude: 3,800m.
Hospitals: Kaza General Hospital (Equipped with oxygen concentrators, AMS specialists).
Emergency Paths: 
- Kaza-Manali (via Kunzum Pass): Closed in winter, high landslide risk.
- Kaza-Shimla: Open year-round but subject to shooting stones in Malling Nallah.

## KUNZUM PASS / ROADS
Altitude: 4,590m.
Connectivity: Links Lahaul and Spiti.
Risk: Sudden blizzards even in summer. Always carry snow chains and extra fuel.
No mobile network at the pass.

## OXYGEN / MEDICAL RESOURCES
- Kaza Hospital: Primary source for oxygen cylinders.
- Losar Checkpost: Emergency oxygen available for travelers descending from Kunzum.
- Tabo Health Center: Basic medical aid.

## FUEL / MECHANIC
- Kaza Indian Oil: The only petrol pump in the entire valley. Expect long queues.
- Mechanic: Available in Kaza market near the bus stand.

## COLD / HYPOTHERMIA
Spiti is a cold desert. Temperatures drop to -30C in winter.
Prevention: Wear 3+ layers (Base, Insulation, Shell).
Treatment: Warm sweet drinks, move to shelter, skin-to-skin contact if severe.

## SNOW BLINDNESS
UV Index: Extremely High.
Prevention: Wear Category 4 polarized sunglasses.
Symptoms: Gritty feeling in eyes, extreme light sensitivity.
`;

const KEYWORDS: Record<string, string[]> = {
  "AMS": ["ams", "headache", "nausea", "altitude", "sick", "vomit", "dizzy"],
  "KAZA": ["kaza", "town", "market", "hospital"],
  "KUNZUM": ["kunzum", "pass", "manali", "road", "chains"],
  "OXYGEN": ["oxygen", "cylinder", "breath", "o2"],
  "FUEL": ["fuel", "petrol", "diesel", "mechanic"],
  "COLD": ["cold", "winter", "temperature", "freeze", "hypothermia"],
};

export function searchLocalKnowledge(query: string): string | null {
  const lowQuery = query.toLowerCase();
  
  // First try direct section match
  const sections = SURVIVAL_GUIDE.split('##');
  for (const section of sections) {
    const title = section.split('\n')[0].toLowerCase();
    if (title.includes(lowQuery)) return section.trim();
  }

  // Then try keyword mapping
  for (const [key, aliases] of Object.entries(KEYWORDS)) {
    if (aliases.some(alias => lowQuery.includes(alias))) {
      const match = sections.find(s => s.toUpperCase().includes(key));
      if (match) return match.trim();
    }
  }
  
  return null;
}
