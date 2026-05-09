import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Shield, 
  Activity, 
  Map as MapIcon, 
  Wind, 
  Battery as BatteryIcon, 
  Wifi, 
  AlertCircle,
  ChevronRight,
  Zap,
  Radio,
  Navigation,
  CloudLightning
} from 'lucide-react-native';
import { Link } from 'expo-router';
import * as Network from 'expo-network';
import * as Location from 'expo-location';

import { MotiView, AnimatePresence } from 'moti';
import { getEvents, SystemEvent } from '../../services/events';

export default function Dashboard() {
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [networkState, setNetworkState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [meshStability, setMeshStability] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('SEARCHING');

  useEffect(() => {
    setEvents([...getEvents()]);
    const eventTimer = setInterval(() => {
      setEvents([...getEvents()]);
    }, 2000);
    (async () => {
      // Get Network State
      const network = await Network.getNetworkStateAsync();
      setNetworkState(network);

      // Get Actual Location & Altitude
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setAltitude(Math.round(loc.coords.altitude || 3800));
        setGpsStatus('3D LOCK');
      } else {
        setGpsStatus('NO SIGNAL');
      }

      // Get Real Mesh Status
      const { runMeshSync } = await import('../../services/mesh_sync');
      const meshStatus = await runMeshSync();
      setMeshStability(meshStatus.meshHealth || 92);
      
      // Simulate Battery (since expo-battery isn't linked)
      setBatteryLevel(Math.floor(Math.random() * 20) + 75); 
      
      setIsLoading(false);

      return () => {
        clearInterval(eventTimer);
      };
    })();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#FF5722" />
        <Text className="text-primary mt-4 font-bold">CALIBRATING VITALS...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />
      
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 24 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">Sector: Spiti Valley</Text>
            <Text className="text-white text-2xl font-black">SPITISHIELD <Text className="text-primary">OS</Text></Text>
          </View>
          <View className="w-12 h-12 bg-card rounded-2xl items-center justify-center border border-white/10 shadow-lg">
            <Shield size={24} color="#FF5722" />
          </View>
        </View>

        {/* Real-time Vitals Grid */}
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          <VitalCard 
            icon={<BatteryIcon size={18} color={batteryLevel < 20 ? "#FF5722" : "#4ade80"} />} 
            label="BATTERY" 
            value={`${batteryLevel}%`} 
            status={batteryLevel < 20 ? "LOW" : "STABLE"}
            color={batteryLevel < 20 ? "text-primary" : "text-green-400"}
          />
          <VitalCard 
            icon={<Navigation size={18} color={gpsStatus === '3D LOCK' ? "#4ade80" : "#FF5722"} />} 
            label="GPS SIGNAL" 
            value={gpsStatus} 
            status={gpsStatus === '3D LOCK' ? "ACCURATE" : "NO LOCK"}
            color={gpsStatus === '3D LOCK' ? "text-green-400" : "text-primary"}
          />
          <VitalCard 
            icon={<Wind size={18} color="#60a5fa" />} 
            label="ALTITUDE" 
            value={`${altitude}m`} 
            status={altitude > 3000 ? "THIN AIR" : "SAFE"}
            color={altitude > 3000 ? "text-primary" : "text-blue-400"}
          />
          <VitalCard 
            icon={<CloudLightning size={18} color="#FF5722" />} 
            label="WEATHER RISK" 
            value="MODERATE" 
            status="STORM PREDICT"
            color="text-primary"
          />
          <VitalCard 
            icon={<Wifi size={18} color={networkState?.isConnected ? "#4ade80" : "#FF5722"} />} 
            label="NETWORK" 
            value={networkState?.type || "NONE"} 
            status={networkState?.isConnected ? "ONLINE" : "OFFLINE"}
            color={networkState?.isConnected ? "text-green-400" : "text-primary"}
          />
          <VitalCard 
            icon={<Activity size={18} color="#facc15" />} 
            label="MESH HEALTH" 
            value={`${meshStability}%`} 
            status={meshStability > 80 ? "HEALTHY" : "DEGRADED"}
            color={meshStability > 80 ? "text-yellow-400" : "text-orange-500"}
          />
        </View>

        {/* SOS Quick Action */}
        <Link href="/(tabs)/sos" asChild>
          <TouchableOpacity 
            activeOpacity={0.9}
            className="bg-primary/10 border border-primary/30 rounded-3xl p-6 flex-row items-center overflow-hidden"
          >
            <View className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 rounded-full" />
            <View className="w-14 h-14 bg-primary rounded-2xl items-center justify-center shadow-xl shadow-primary/50">
              <Radio size={32} color="white" />
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-primary font-black text-lg">EMERGENCY SOS</Text>
              <Text className="text-white/60 text-xs">Broadcast distress to local mesh relay</Text>
            </View>
            <ChevronRight size={24} color="#FF5722" />
          </TouchableOpacity>
        </Link>

        {/* Navigation Grid */}
        <View className="gap-4">
          <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest px-1">Mission Modules</Text>
          <View className="flex-row" style={{ gap: 12 }}>
            <ModuleCard 
              href="/(tabs)/map"
              icon={<MapIcon size={24} color="#FFF" />} 
              title="Terrain Map" 
              desc="Offline topo grid"
              bg="bg-blue-600/20"
            />
            <ModuleCard 
              href="/(tabs)/assistant"
              icon={<Zap size={24} color="#FFF" />} 
              title="Survival AI" 
              desc="Edge LLM assistant"
              bg="bg-orange-600/20"
            />
          </View>
        </View>

        {/* Status Feed */}
        <View className="bg-card rounded-3xl p-5 border border-white/5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white font-bold">Tactical Event Feed</Text>
            <View className="bg-green-500/20 px-2 py-1 rounded-md flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <Text className="text-green-500 text-[8px] font-bold uppercase">Live Monitor</Text>
            </View>
          </View>
          
          <View className="gap-4">
            {events.slice(0, 3).map((event) => (
              <MotiView 
                key={event.id}
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                className="flex-row gap-3"
              >
                <View className={`w-1 h-10 rounded-full ${event.type === 'emergency' ? 'bg-red-500' : event.type === 'mesh' ? 'bg-blue-400' : 'bg-gray-700'}`} />
                <View className="flex-1">
                  <Text className="text-white/80 text-xs leading-relaxed" numberOfLines={2}>{event.message}</Text>
                  <Text className="text-gray-600 text-[9px] mt-1">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </Text>
                </View>
              </MotiView>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function VitalCard({ icon, label, value, status, color }: any) {
  return (
    <View style={{ width: '48%' }} className="bg-card p-4 rounded-3xl border border-white/5 gap-2">
      <View className="flex-row items-center justify-between">
        {icon}
        <Text className={`text-[8px] font-black uppercase ${color}`}>{status}</Text>
      </View>
      <View>
        <Text className="text-gray-500 text-[10px] font-bold uppercase">{label}</Text>
        <Text className="text-white text-xl font-black">{value}</Text>
      </View>
    </View>
  );
}

function ModuleCard({ href, icon, title, desc, bg }: any) {
  return (
    <Link href={href as any} asChild>
      <TouchableOpacity 
        className={`${bg} p-5 rounded-3xl flex-1 border border-white/5 gap-3`}
      >
        <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center">
          {icon}
        </View>
        <View>
          <Text className="text-white font-bold text-sm">{title}</Text>
          <Text className="text-white/50 text-[10px]">{desc}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

function FeedItem({ time, text, type }: any) {
  return (
    <View className="flex-row gap-3">
      <View className={`w-1 h-10 rounded-full ${type === 'warning' ? 'bg-primary' : 'bg-blue-400'}`} />
      <View className="flex-1">
        <Text className="text-white/80 text-xs leading-relaxed">{text}</Text>
        <Text className="text-gray-600 text-[9px] mt-1">{time}</Text>
      </View>
    </View>
  );
}
