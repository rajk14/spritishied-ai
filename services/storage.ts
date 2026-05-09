import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const GEMINI_KEY = 'spitishield_gemini_key';
const OLLAMA_URL = 'spitishield_ollama_url';

export async function saveApiKey(key: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(GEMINI_KEY, key);
  } else {
    await SecureStore.setItemAsync(GEMINI_KEY, key);
  }
}

export async function saveOllamaUrl(url: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(OLLAMA_URL, url);
  } else {
    await SecureStore.setItemAsync(OLLAMA_URL, url);
  }
}

export async function getApiKey() {
  if (Platform.OS === 'web') {
    return localStorage.getItem(GEMINI_KEY);
  }
  return await SecureStore.getItemAsync(GEMINI_KEY);
}

export async function getOllamaUrl() {
  let url = null;
  if (Platform.OS === 'web') {
    url = localStorage.getItem(OLLAMA_URL);
  } else {
    url = await SecureStore.getItemAsync(OLLAMA_URL);
  }
  return url || 'http://192.168.1.1:11434'; // Default Survival Mesh Gateway
}

export async function deleteApiKey() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(GEMINI_KEY);
  } else {
    await SecureStore.deleteItemAsync(GEMINI_KEY);
  }
}
