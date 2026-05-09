import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, CheckCircle2, ChevronRight, AlertCircle, Info, Zap, Compass, Activity, Shield, RefreshCw } from 'lucide-react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { journeyManager } from '../../services/journey';

const INITIAL_STOPS = [
  { id: 'del', name: 'Delhi / Chandigarh', alt: 250, status: 'current', desc: 'Base level. Preparation and supply check.', hazards: 'Low' },
  { id: 'shi', name: 'Shimla', alt: 2200, status: 'upcoming', desc: 'Acclimatization starts. Hydration critical.', hazards: 'Moderate' },
  { id: 'kal', name: 'Kalpa', alt: 2960, status: 'upcoming', desc: 'High altitude threshold. Monitor symptoms.', hazards: 'High' },
  { id: 'ran', name: 'Rangrik / Spiti', alt: 3700, status: 'upcoming', desc: 'Oxygen levels drop. Extreme survival zone.', hazards: 'Extreme' },
  { id: 'nar', name: 'Narkanda / Rampur', alt: 2700, status: 'upcoming', desc: 'Descent phase. Recovery protocol.', hazards: 'Moderate' },
];

export default function JourneyScreen() {
  const router = useRouter();
  const [stops, setStops] = useState<any[]>(INITIAL_STOPS);
  const [activeStopId, setActiveStopId] = useState('del');
  const [currentAltitude, setCurrentAltitude] = useState(2200);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    journeyManager.setStops(stops);
    journeyManager.setActiveStop(activeStopId);
    journeyManager.setAltitude(currentAltitude);
  }, [stops, activeStopId, currentAltitude]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      const loc = await Location.getCurrentPositionAsync({});
      if (loc.coords.altitude) {
        const alt = Math.round(loc.coords.altitude);
        setCurrentAltitude(alt);
        journeyManager.setAltitude(alt);
      }
    })();
  }, []);

  const handleCheckIn = (id: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const newStops = stops.map(stop => {
        if (stop.id === id) return { ...stop, status: 'complete' };
        const currentIndex = stops.findIndex(s => s.id === id);
        if (stops[currentIndex + 1] && stops[currentIndex + 1].id === stop.id) {
          return { ...stop, status: 'current' };
        }
        return stop;
      });
      setStops(newStops);
      journeyManager.setStops(newStops);
      setIsLoading(false);
    }, 1500);
  };

  const handleReset = () => {
    setStops(INITIAL_STOPS);
    setActiveStopId('del');
    setCurrentAltitude(250);
  };

  const activeStop = stops.find(s => s.id === activeStopId) || stops[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* HEADER SECTION */}
        <View className="mb-8 flex-row justify-between items-start">
          <View>
            <Text className="text-white text-3xl font-black">SPITI <Text className="text-primary">JOURNEY</Text></Text>
            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Tactical Route Monitoring Protocol</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="items-end">
              <Text className="text-primary text-xl font-black">{currentAltitude}m</Text>
              <Text className="text-gray-600 text-[8px] font-bold uppercase">Current ASL</Text>
            </View>
            <TouchableOpacity 
              onPress={handleReset}
              className="p-3 bg-white/5 rounded-2xl border border-white/10"
            >
              <RefreshCw size={18} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ACTIVE SECTOR CARD */}
        <MotiView 
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <View style={{ marginBottom: 40 }}>
            <LinearGradient
              colors={['#1a1a1a', '#0a0a0a']}
              style={styles.activeCard}
            >
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center gap-3">
                  <View className="bg-primary/20 p-2 rounded-lg">
                    <Compass size={20} color="#FF5722" />
                  </View>
                  <View>
                    <Text className="text-gray-500 text-[10px] font-black uppercase">Active Sector</Text>
                    <Text className="text-white text-xl font-black">{activeStop.name}</Text>
                  </View>
                </View>
                <View className="bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                  <Text className="text-red-500 text-[8px] font-black uppercase">{activeStop.hazards} RISK</Text>
                </View>
              </View>

              <Text className="text-gray-400 text-xs leading-5 mb-6">{activeStop.desc}</Text>

              <View className="flex-row gap-3 mb-6">
                <TouchableOpacity 
                  onPress={() => router.push('/map')}
                  className="flex-1 bg-white/5 border border-white/10 p-3 rounded-2xl items-center flex-row justify-center gap-2"
                >
                  <MapPin size={14} color="#888" />
                  <Text className="text-white text-[10px] font-black uppercase">Scan Terrain</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => router.push('/assistant')}
                  className="flex-1 bg-white/5 border border-white/10 p-3 rounded-2xl items-center flex-row justify-center gap-2"
                >
                  <Zap size={14} color="#888" />
                  <Text className="text-white text-[10px] font-black uppercase">Run Flow</Text>
                </TouchableOpacity>
              </View>

              {activeStop.status !== 'complete' ? (
                <TouchableOpacity 
                  onPress={() => handleCheckIn(activeStop.id)}
                  disabled={isLoading}
                  className="bg-primary py-4 rounded-2xl flex-row items-center justify-center gap-3"
                >
                  {isLoading ? <ActivityIndicator color="white" size="small" /> : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <CheckCircle2 size={18} color="white" />
                      <Text className="text-white font-black uppercase">Check-In to Sector</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ) : (
                <View className="bg-green-500/10 border border-green-500/30 py-4 rounded-2xl items-center flex-row justify-center gap-2">
                  <CheckCircle2 size={18} color="#4ade80" />
                  <Text className="text-green-500 font-black uppercase">Sector Secured</Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </MotiView>

        {/* TIMELINE SECTION */}
        <Text className="text-white text-xs font-black uppercase tracking-widest mb-6">Route Manifest</Text>
        <View style={styles.timeline}>
          {stops.map((stop, index) => (
            <TouchableOpacity 
              key={stop.id}
              activeOpacity={0.7}
              onPress={() => setActiveStopId(stop.id)}
              style={styles.stopRow}
            >
              <View style={styles.indicatorContainer}>
                <View style={[
                  styles.dot, 
                  stop.status === 'complete' ? styles.dotComplete : 
                  stop.status === 'current' ? styles.dotCurrent : 
                  styles.dotUpcoming,
                  activeStopId === stop.id ? { transform: [{ scale: 1.2 }] } : {}
                ]} />
                {index < stops.length - 1 && <View style={[styles.line, stop.status === 'complete' ? styles.lineComplete : styles.lineUpcoming]} />}
              </View>

              <View className={`flex-1 ml-4 mb-8 p-4 rounded-2xl border ${activeStopId === stop.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent'}`}>
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className={`font-black text-lg ${stop.status === 'upcoming' ? 'text-gray-600' : 'text-white'}`}>{stop.name}</Text>
                    <Text className="text-primary text-[10px] font-black uppercase">{stop.alt}m ASL</Text>
                  </View>
                  {stop.status === 'complete' && <CheckCircle2 size={16} color="#4ade80" />}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* BOTTOM WARNING */}
        {currentAltitude > 2500 && (
          <MotiView 
            from={{ translateY: 20, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
          >
            <View className="bg-red-500/20 border border-red-500/30 p-6 rounded-3xl gap-3">
              <View className="flex-row items-center gap-3">
                <AlertCircle size={24} color="#F44336" />
                <Text className="text-white font-black text-lg">HIGH ALTITUDE ALERT</Text>
              </View>
              <Text className="text-gray-300 text-xs leading-5">
                Warning: You are currently above the acclimatization threshold (2500m). Ensure you have established a Mesh Link in the Community tab and checked for nearby Oxygen points in the Map.
              </Text>
            </View>
          </MotiView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  activeCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  timeline: {
    paddingLeft: 10,
  },
  stopRow: {
    flexDirection: 'row',
  },
  indicatorContainer: {
    alignItems: 'center',
    width: 24,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    zIndex: 10,
    backgroundColor: '#050505',
  },
  dotComplete: { borderColor: '#4ade80', backgroundColor: '#4ade80' },
  dotCurrent: { borderColor: '#FF5722', backgroundColor: '#FF5722' },
  dotUpcoming: { borderColor: '#333' },
  line: {
    width: 2,
    flex: 1,
    marginTop: -2,
    marginBottom: -2,
  },
  lineComplete: { backgroundColor: '#4ade80' },
  lineUpcoming: { backgroundColor: '#333' },
});
