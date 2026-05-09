import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  AlertTriangle, 
  WifiOff, 
  MapPin,
  CheckCircle2,
  Radio,
  Share2,
  Volume2
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';

import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { saveNode } from '../../services/db';

export default function SOSScreen() {
  const [isActivating, setIsActivating] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [distressToken, setDistressToken] = useState('');
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    let interval: any;
    if (isBeaconActive) {
      interval = setInterval(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Speech.speak("SOS. Help needed.", { volume: 1.0, rate: 0.8 });
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
      Speech.stop();
    };
  }, [isBeaconActive]);


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setIsScannerOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Parse SOS data (example: SOS-12345-LAT-LNG)
    const parts = data.split('-');
    const name = parts[0] === 'SOS' ? `Distress: ${parts[1].slice(-4)}` : 'Mesh Node';
    
    await saveNode(data, name, 'SOS ACTIVE', 'Calculating...', 'Emergency');
    alert(`MESH LINK ESTABLISHED: ${name} is now tracked in your Community tab.`);
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) return;
    }
    setIsScannerOpen(true);
  };
  const triggerSOS = async () => {
    setIsActivating(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Simulate mesh handshake
    setTimeout(() => {
      const token = `SOS-${Date.now()}-${location?.coords.latitude.toFixed(4)}-${location?.coords.longitude.toFixed(4)}`;
      setDistressToken(token);
      setIsActive(true);
      setIsActivating(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 3000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 24 }}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-3xl font-black">EMERGENCY <Text className="text-primary">SOS</Text></Text>
            <Text className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Satellite Mesh Protocol v4.0</Text>
          </View>
          <TouchableOpacity 
            onPress={openScanner}
            className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 items-center justify-center"
          >
            <CheckCircle2 size={24} color="#FF5722" />
          </TouchableOpacity>
        </View>

        {!isActive ? (
          <View className="items-center py-6 gap-8">
            <MotiView
              animate={{
                scale: isActivating ? [1, 1.2, 1] : 1,
                opacity: isActivating ? 0.5 : 1,
              }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 1000,
              }}
            >
              <TouchableOpacity 
                onLongPress={triggerSOS}
                disabled={isActivating}
                activeOpacity={0.8}
                style={styles.sosButton}
              >
                {isActivating ? (
                  <ActivityIndicator color="white" size="large" />
                ) : (
                  <AlertTriangle size={64} color="white" />
                )}
              </TouchableOpacity>
            </MotiView>

            <View className="items-center gap-2">
              <Text className="text-white font-black text-lg tracking-widest uppercase">
                {isActivating ? 'BROADCASTING...' : 'LONG PRESS SOS'}
              </Text>
              <Text className="text-gray-500 text-center text-[10px] font-bold uppercase px-10">
                Rescuers: Tap the top-right [SCAN] icon to link with a victim.
              </Text>
            </View>
          </View>
        ) : (
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="gap-6"
          >
            <View className="bg-green-500/10 border border-green-500/30 p-6 rounded-3xl items-center gap-4">
              <CheckCircle2 size={48} color="#4CAF50" />
              <View className="items-center">
                <Text className="text-green-500 font-black text-xl text-center">DISTRESS SIGNAL ACTIVE</Text>
                <Text className="text-white/60 text-xs text-center">Transmitting on 433MHz Mesh Frequency</Text>
              </View>
            </View>

            <View className="bg-card p-6 rounded-3xl border border-white/10 gap-6">
              <View className="items-center gap-4">
                <View className="bg-white p-3 rounded-2xl">
                  <QRCode value={distressToken} size={150} />
                </View>
                <Text className="text-white font-mono text-[10px] tracking-tighter">{distressToken}</Text>
              </View>

              <View className="gap-3">
                <InfoRow icon={<MapPin size={14} color="#666" />} label="Last Known Location" value={`${location?.coords.latitude.toFixed(5)}, ${location?.coords.longitude.toFixed(5)}`} />
                <InfoRow icon={<WifiOff size={14} color="#FF5722" />} label="Comm Status" value="LOCAL MESH ONLY" />
                <InfoRow icon={<Radio size={14} color="#2196F3" />} label="Signal Strength" value="88 dBm" />
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setIsActive(false)}
              className="bg-white/5 p-4 rounded-2xl items-center border border-white/10"
            >
              <Text className="text-gray-500 font-bold uppercase text-xs">Cancel Distress Signal</Text>
            </TouchableOpacity>
          </MotiView>
        )}

        <View className="bg-card p-5 rounded-3xl border border-white/5 gap-4">
          <View className="flex-row items-center gap-3">
            <Volume2 size={20} color={isBeaconActive ? "#FF5722" : "#666"} />
            <Text className="text-white font-bold">Emergency Audio Beacon</Text>
          </View>
          <Text className="text-gray-500 text-xs">
            Activates a high-frequency voice signal every 5 seconds to help rescuers locate you in zero visibility.
          </Text>
          <TouchableOpacity 
            onPress={() => setIsBeaconActive(!isBeaconActive)}
            className={`py-3 rounded-xl items-center border ${isBeaconActive ? 'bg-primary/20 border-primary' : 'bg-white/5 border-white/10'}`}
          >
            <Text className={`font-black text-xs ${isBeaconActive ? 'text-primary' : 'text-white'}`}>
              {isBeaconActive ? 'DEACTIVATE BEACON' : 'ENABLE AUDIO BEACON'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SOS SCANNER MODAL */}
      <Modal visible={isScannerOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
          />
          <BlurView intensity={80} tint="dark" style={styles.scannerOverlay}>
            <SafeAreaView className="flex-1 items-center justify-between py-10">
              <TouchableOpacity onPress={() => setIsScannerOpen(false)} className="self-end px-8">
                <Text className="text-white font-black text-lg">CANCEL</Text>
              </TouchableOpacity>
              
              <View className="w-64 h-64 border-2 border-primary rounded-3xl items-center justify-center">
                <View className="w-48 h-1 bg-primary/50" />
              </View>

              <View className="items-center px-10">
                <Text className="text-white text-xl font-black text-center">SCAN SOS TOKEN</Text>
                <Text className="text-gray-400 text-xs text-center mt-2 font-bold uppercase">Point camera at victim's distress QR code to establish link</Text>
              </View>
            </SafeAreaView>
          </BlurView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: any) {
  return (
    <View className="flex-row items-center justify-between border-b border-white/5 pb-2">
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="text-gray-500 text-[10px] font-bold uppercase">{label}</Text>
      </View>
      <Text className="text-white text-xs font-bold">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sosButton: {
    width: 160,
    height: 160,
    backgroundColor: '#FF5722',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  }
});
