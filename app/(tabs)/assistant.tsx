import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Send, 
  Bot, 
  User, 
  Cpu, 
  WifiOff, 
  Wifi,
  Zap,
  Info,
  Settings as SettingsIcon,
  X,
  Globe,
  Volume2,
  VolumeX
} from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import { getAIResponse, ModelType } from '../../services/ai';
import { getApiKey, saveApiKey, getOllamaUrl, saveOllamaUrl } from '../../services/storage';
import { Modal } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import * as Speech from 'expo-speech';
import { initDatabase, saveMessage, getMessages, clearMessages } from '../../services/db';
import { automationEngine } from '../../services/automation';
import { addEvent } from '../../services/events';
import { journeyManager } from '../../services/journey';

export default function AssistantScreen() {
  const [model, setModel] = useState<ModelType>('phi-3');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('');
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!(state.isConnected && state.isInternetReachable));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      // Initialize DB and load messages
      await initDatabase();
      const savedMessages = await getMessages();
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      } else {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: 'I am SpitiShield AI. Choose your brain: Local Retrieval, Cloud (Gemini), or Local Mesh (Ollama).',
        }]);
      }

      const [savedKey, savedOllama] = await Promise.all([getApiKey(), getOllamaUrl()]);
      if (savedKey) setApiKey(savedKey);
      if (savedOllama) setOllamaUrl(savedOllama);
      setIsModelLoading(false);
    })();
  }, []);

  const saveConfig = async () => {
    await Promise.all([saveApiKey(apiKey), saveOllamaUrl(ollamaUrl)]);
    setIsSettingsOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsgId = Date.now().toString();
    const userMessage = { id: userMsgId, role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMsgId, 'user', input);
    
    setInput('');
    setIsTyping(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

    try {
      const journeyContext = journeyManager.getJourneyContext();
      const enrichedPrompt = `${journeyContext}\n\nUSER_QUERY: ${input}`;
      const responseStream = getAIResponse(enrichedPrompt, model, apiKey, ollamaUrl); 
      
      let fullContent = "";
      for await (const chunk of responseStream) {
        fullContent += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId ? { ...msg, content: fullContent } : msg
        ));
      }

      // Save final assistant message to DB
      await saveMessage(assistantMsgId, 'assistant', fullContent);

      // If speech is enabled, speak the final answer
      if (isSpeechEnabled) {
        Speech.speak(fullContent, { rate: 0.9, pitch: 1.0 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between border-b border-white/5">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-primary/20 rounded-xl items-center justify-center border border-primary/30">
              <Bot size={22} color="#FF5722" />
            </View>
            <View>
              <Text className="text-white font-black text-lg" style={{ fontWeight: '900', letterSpacing: 1 }}>SURVIVAL <Text className="text-primary">AI</Text></Text>
              <Text className={`text-[10px] uppercase font-bold tracking-tighter ${model === 'gemini' && isOnline ? 'text-blue-500' : 'text-green-500'}`}>
                {model === 'gemini' && isOnline ? 'Satellite Link Active' : 'Local Inference Active'}
              </Text>
            </View>
          </View>
          <View style={{ gap: 12 }} className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => {
                setIsSpeechEnabled(!isSpeechEnabled);
                if (isSpeechEnabled) Speech.stop();
              }} 
              className={`p-2 rounded-lg ${isSpeechEnabled ? 'bg-primary/20' : 'bg-white/5'}`}
            >
              {isSpeechEnabled ? <Volume2 size={18} color="#FF5722" /> : <VolumeX size={18} color="#888" />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsSettingsOpen(true)} className="p-2 bg-white/5 rounded-lg">
              <SettingsIcon size={18} color="#888" />
            </TouchableOpacity>
            {isOnline ? <Wifi size={16} color={model === 'gemini' ? "#2196F3" : "#666"} /> : <WifiOff size={16} color="#666" />}
          </View>
        </View>

        {/* Model Selector */}
        <View className="px-6 py-3 flex-row gap-2 border-b border-white/5">
          {(['phi-3', 'gemma', 'ollama', 'gemini'] as const).map((m) => (
            <TouchableOpacity 
              key={m}
              onPress={() => setModel(m)}
              className={`px-4 py-2 rounded-full border ${model === m ? 'bg-primary border-primary' : 'bg-white/5 border-white/10'}`}
            >
              <Text className={`text-[10px] font-black uppercase ${model === m ? 'text-white' : 'text-gray-500'}`}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AUTO-RESCUE FLOWS */}
        <View className="px-6 py-4 bg-primary/5 border-b border-white/5">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <Zap size={14} color="#FF5722" />
              <Text className="text-white font-black text-xs uppercase">AutoRescue Flows</Text>
            </View>
            <TouchableOpacity 
              onPress={async () => {
                const actions = await automationEngine.checkFlows(['headache', 'dizziness']);
                if (actions.length > 0) {
                  addEvent(`Flow Triggered: ${actions.join(', ')}`, 'warning');
                  actions.forEach(a => automationEngine.runAction(a));
                }
              }}
              className="bg-primary/20 px-3 py-1 rounded-lg border border-primary/30"
            >
              <Text className="text-primary text-[10px] font-black uppercase">Run Diagnostic</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
            <View className="bg-white/5 px-4 py-3 rounded-2xl border border-white/10 mr-3">
              <Text className="text-white text-[10px] font-black">AMS_PROTOCOL</Text>
              <Text className="text-gray-500 text-[8px] uppercase font-bold mt-1">Status: Monitoring</Text>
            </View>
            <View className="bg-white/5 px-4 py-3 rounded-2xl border border-white/10">
              <Text className="text-white text-[10px] font-black">LOW_POWER_SOS</Text>
              <Text className="text-gray-500 text-[8px] uppercase font-bold mt-1">Status: Idle</Text>
            </View>
          </ScrollView>
        </View>

        <ScrollView 
          ref={scrollRef}
          className="flex-1 px-4 py-6"
          contentContainerStyle={{ gap: 20, paddingBottom: 100 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <MotiView
              key={msg.id}
              from={{ opacity: 0, scale: 0.9, translateY: 10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.assistantBubble
              ]}
            >
              {msg.role === 'assistant' && (
                <View className="w-6 h-6 bg-primary/20 rounded-lg items-center justify-center mr-2 mb-2">
                  <Cpu size={12} color="#FF5722" />
                </View>
              )}
              <Text style={styles.messageText}>
                {msg.content || (isTyping && msg.role === 'assistant' ? '...' : '')}
              </Text>
            </MotiView>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={{ paddingBottom: Platform.OS === 'ios' ? 100 : 90 }} className="p-4 bg-transparent">
          <BlurView intensity={20} tint="dark" style={styles.inputWrapper}>
            <TextInput 
              className="flex-1 text-white text-sm px-4 py-3"
              placeholder="Query local brain..."
              placeholderTextColor="#555"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity 
              onPress={handleSend}
              disabled={!input.trim()}
              className={`w-10 h-10 rounded-xl items-center justify-center mr-2 ${input.trim() ? 'bg-primary' : 'bg-white/5'}`}
            >
              <Send size={18} color={input.trim() ? 'white' : '#444'} />
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* Settings Modal */}
        <Modal visible={isSettingsOpen} transparent animationType="slide">
          <View className="flex-1 bg-black/80 justify-end">
            <MotiView 
              from={{ translateY: 300 }}
              animate={{ translateY: 0 }}
              className="bg-card p-8 rounded-t-[40px] border-t border-white/10 gap-6"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-white font-black text-2xl">CONFIG</Text>
                <TouchableOpacity onPress={() => setIsSettingsOpen(false)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <ConfigInput label="Gemini API Key" value={apiKey} onChange={setApiKey} icon={<Globe size={14} color="#2196F3" />} secure />
                <ConfigInput label="Ollama Endpoint" value={ollamaUrl} onChange={setOllamaUrl} icon={<Cpu size={14} color="#FF5722" />} placeholder="http://192.168..." />
              </View>

              <TouchableOpacity 
                onPress={saveConfig}
                className="bg-primary p-5 rounded-2xl items-center shadow-lg shadow-primary/30"
              >
                <Text className="text-white font-black">SAVE PROTOCOL</Text>
              </TouchableOpacity>
            </MotiView>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ConfigInput({ label, value, onChange, icon, secure, placeholder }: any) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="text-gray-500 text-xs font-bold uppercase">{label}</Text>
      </View>
      <TextInput 
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || "Enter..."}
        placeholderTextColor="#333"
        secureTextEntry={secure}
        className="bg-black/50 border border-white/5 rounded-2xl p-4 text-white text-sm"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  messageBubble: {
    padding: 16,
    borderRadius: 24,
    maxWidth: '85%',
    borderWidth: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 87, 34, 0.05)',
    borderColor: 'rgba(255, 87, 34, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  }
});
