import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchLocalKnowledge } from "./local_knowledge";
import { getTinyBrainResponse } from "./tiny_brain";
import NetInfo from "@react-native-community/netinfo";

// Simulated Token Streaming
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export type ModelType = 'phi-3' | 'gemma' | 'tinyllama' | 'ollama' | 'gemini';

export async function* getAIResponse(prompt: string, model: ModelType, apiKey?: string, ollamaUrl?: string) {
  const lowPrompt = prompt.toLowerCase();
  
  // 0. CHECK REAL NETWORK STATUS
  const network = await NetInfo.fetch();
  const isActuallyOnline = network.isConnected && network.isInternetReachable;

  // 1. PRIORITY: EMERGENCY RULE ENGINE (Matches high-risk keywords)
  const emergencyKeywords = ["ams", "sick", "headache", "dizzy", "oxygen", "breath", "blood"];
  if (emergencyKeywords.some(k => lowPrompt.includes(k))) {
    const localMatch = searchLocalKnowledge(prompt);
    if (localMatch) {
      const response = `[CRITICAL SURVIVAL BRAIN] Emergency protocol detected:\n\n${localMatch}\n\nTIP: Check the MEDICAL TRIAGE screen for a full diagnosis.`;
      for (const word of response.split(' ')) { await sleep(40); yield word + ' '; }
      return;
    }
  }

  // 2. OLLAMA INFERENCE (Local Mesh)
  if (model === 'ollama' && ollamaUrl) {
    try {
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'phi3', prompt: prompt, stream: false }), 
      });
      const data = await response.json();
      if (data.response) {
        const prefix = `[OLLAMA MESH] `;
        for (const word of prefix.split(' ')) { yield word + ' '; }
        for (const word of data.response.split(' ')) { await sleep(20); yield word + ' '; }
        return;
      }
    } catch (e) {
      console.warn("Ollama unavailable, falling back to local brain.");
    }
  }

  // 3. CLOUD GEMINI (If online and selected)
  if (model === 'gemini') {
    if (!isActuallyOnline) {
      const offlineMsg = `[OFFLINE MODE] No internet detected. Gemini 1.5 Flash is unavailable. Switching to Local Survival Brain... `;
      for (const word of offlineMsg.split(' ')) { await sleep(20); yield word + ' '; }
      // Fall through to local
    } else if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY") {
      try {
        // Direct REST API Call (Avoids SDK issues on Web/Native)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2048 }
          }),
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message);
        }

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const content = data.candidates[0].content.parts[0].text;
          const prefix = `[GEMINI 1.5 FLASH] `;
          for (const word of prefix.split(' ')) { yield word + ' '; }
          for (const word of content.split(' ')) { 
            await sleep(20); 
            yield word + ' '; 
          }
          return;
        }
      } catch (e: any) {
        const errorMsg = `[GEMINI API ERROR] ${e.message}. Switching to local brain... `;
        for (const word of errorMsg.split(' ')) { await sleep(20); yield word + ' '; }
      }
    } else {
      const missingKeyMsg = `[CONFIG REQUIRED] Gemini model selected but no API key detected. Please enter your key in the SETTINGS (gear icon) to use real Gemini intelligence. `;
      for (const word of missingKeyMsg.split(' ')) { await sleep(20); yield word + ' '; }
    }
  }

  // 4. REAL LOCAL RETRIEVAL (General Survival)
  const localMatch = searchLocalKnowledge(prompt);
  if (localMatch) {
    const response = `[OFFLINE SURVIVAL BRAIN] Found in database:\n\n${localMatch}`;
    for (const word of response.split(' ')) { await sleep(40); yield word + ' '; }
    return;
  }

  // 5. TINYLLAMA / LOCAL INFERENCE SIMULATION (General Logic)
  const tinyResponse = getTinyBrainResponse(prompt);
  if (tinyResponse) {
    const modelName = model.toUpperCase();
    const response = `[${modelName} LOCAL] ${tinyResponse}`;
    for (const word of response.split(' ')) { await sleep(30); yield word + ' '; }
    return;
  }

  // 6. Final Fallback
  const fallback = `[OFFLINE] I don't have a specific answer for "${prompt}". Please try keywords like 'Kaza', 'Oxygen', 'AMS', or 'Weather'.`;
  for (const word of fallback.split(' ')) { await sleep(30); yield word + ' '; }
}
