import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation, AlertTriangle, Battery, Wind, Shield, Globe, X, Activity } from 'lucide-react-native';
import { MotiView } from 'moti';

const { width, height } = Dimensions.get('window');

const MARKERS = [
  { 
    id: 1, 
    title: 'Kaza Health Center', 
    type: 'oxygen', 
    x: 120, y: 340, 
    desc: 'Primary oxygen refilling station for Kaza sector. Equipped with 4 concentrators.', 
    coords: '32.2276°N, 78.0710°E',
    status: 'Operational',
    capacity: '85%',
    lastVerified: '12m ago',
    risk: 'Low'
  },
  { 
    id: 2, 
    title: 'Malling Landslide', 
    type: 'hazard', 
    x: 280, y: 150, 
    desc: 'Active rockfall zone. Road is partially blocked. Heavy machinery deployed.', 
    coords: '32.2500°N, 78.1000°E',
    status: 'DANGER',
    capacity: 'CLOSED',
    lastVerified: '45m ago',
    risk: 'EXTREME'
  },
  { 
    id: 3, 
    title: 'Survival Cache B', 
    type: 'resource', 
    x: 60, y: 480, 
    desc: 'Emergency supply point containing blankets, high-calorie food, and basic first aid.', 
    coords: '32.2000°N, 78.0500°E',
    status: 'Full',
    capacity: '100%',
    lastVerified: '2h ago',
    risk: 'Low'
  }
];

export default function MapScreen() {
  const [selectedMarker, setSelectedMarker] = React.useState<any>(null);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MotiView
          from={{ opacity: 0.1, scale: 1 }}
          animate={{ opacity: 0.2, scale: 1.1 }}
          transition={{ loop: true, duration: 4000, type: 'timing' }}
          style={styles.radarPing}
        />
        
        <View style={styles.gridContainer}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 8.3}%` }]} />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 5}%` }]} />
          ))}
        </View>

        {MARKERS.map(marker => (
          <TouchableOpacity 
            key={marker.id} 
            onPress={() => setSelectedMarker(marker)}
            style={[styles.markerWrapper, { left: marker.x, top: marker.y }]}
          >
            <MotiView
              from={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
              transition={{ loop: true, duration: 2000 }}
              style={[styles.markerPing, { backgroundColor: marker.type === 'hazard' ? '#f43f5e' : '#3b82f6' }]}
            />
            <View style={[
              styles.markerIcon, 
              marker.type === 'hazard' ? styles.hazardMarker : styles.resourceMarker,
              selectedMarker?.id === marker.id && { borderColor: '#FF5722', borderWidth: 3 }
            ]}>
              {marker.type === 'hazard' ? <AlertTriangle size={12} color="white" /> : <MapPin size={12} color="white" />}
            </View>
            <MotiView 
              animate={{ opacity: selectedMarker?.id === marker.id ? 1 : 0.6 }}
              style={styles.markerLabelContainer}
            >
              <Text style={styles.markerLabelText}>{marker.title}</Text>
            </MotiView>
          </TouchableOpacity>
        ))}

        <View style={styles.compassContainer}>
          <Text style={styles.compassText}>N</Text>
          <View style={styles.compassNeedle} />
        </View>
      </View>

      <Modal
        visible={!!selectedMarker}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMarker(null)}
      >
        <View style={styles.modalOverlay}>
          <MotiView 
            from={{ translateY: 300 }}
            animate={{ translateY: 0 }}
            style={styles.intelModal}
          >
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1">
                <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Sector Intelligence</Text>
                <Text className="text-white text-2xl font-black">{selectedMarker?.title}</Text>
                <Text className="text-primary text-[10px] font-black">{selectedMarker?.coords}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedMarker(null)} className="bg-white/5 p-2 rounded-xl">
                <X size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-4 mb-8">
              <IntelStat label="STATUS" value={selectedMarker?.status} color={selectedMarker?.type === 'hazard' ? '#f43f5e' : '#4ade80'} />
              <IntelStat label="CAPACITY" value={selectedMarker?.capacity} color="#FFF" />
              <IntelStat label="RISK" value={selectedMarker?.risk} color={selectedMarker?.risk === 'EXTREME' ? '#f43f5e' : '#666'} />
            </View>

            <View className="bg-white/5 p-5 rounded-3xl border border-white/10 mb-8">
              <Text className="text-white/80 text-sm leading-6">{selectedMarker?.desc}</Text>
              <View className="flex-row items-center gap-2 mt-4">
                <Activity size={12} color="#666" />
                <Text className="text-gray-600 text-[9px] font-bold uppercase">Last Tactical Update: {selectedMarker?.lastVerified}</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setSelectedMarker(null)}
              className="bg-primary py-5 rounded-2xl items-center shadow-lg shadow-primary/30"
            >
              <Text className="text-white font-black uppercase">Navigate to Vector</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </Modal>

      <SafeAreaView style={styles.hudOverlay} pointerEvents="box-none">
        <View style={styles.topHud}>
          <View style={styles.sectorTag}>
            <Text style={styles.sectorText}>SECTOR: KAZA_WEST</Text>
            <Text style={styles.coordText}>32.2° N | 78.1° E</Text>
          </View>
        </View>

        <View style={styles.bottomHud}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}>
            <LegendItem icon={<AlertTriangle size={14} color="#f43f5e" />} label="HAZARD" color="#f43f5e" />
            <LegendItem icon={<MapPin size={14} color="#3b82f6" />} label="OXYGEN" color="#3b82f6" />
            <LegendItem icon={<Battery size={14} color="#22c55e" />} label="STATION" color="#22c55e" />
            <LegendItem icon={<Wind size={14} color="#eab308" />} label="SHELTER" color="#eab308" />
          </ScrollView>
          
          <TouchableOpacity style={styles.recenterBtn}>
            <Navigation size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function IntelStat({ label, value, color }: any) {
  return (
    <View className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
      <Text className="text-gray-600 text-[8px] font-black uppercase mb-1">{label}</Text>
      <Text className="font-black text-xs" style={{ color }}>{value}</Text>
    </View>
  );
}

function LegendItem({ icon, label, color }: any) {
  return (
    <View style={[styles.legendItem, { borderColor: color + '30' }]}>
      {icon}
      <Text style={[styles.legendText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mapContainer: { flex: 1, backgroundColor: '#050505', position: 'relative', overflow: 'hidden' },
  gridContainer: { ...StyleSheet.absoluteFillObject },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  radarPing: { position: 'absolute', top: '20%', left: '10%', width: 600, height: 600, borderRadius: 300, borderWidth: 2, borderColor: '#FF5722' },
  markerWrapper: { position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 100, height: 100, zIndex: 50 },
  markerPing: { position: 'absolute', width: 40, height: 40, borderRadius: 20, opacity: 0.3 },
  markerIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' },
  hazardMarker: { backgroundColor: '#f43f5e' },
  resourceMarker: { backgroundColor: '#3b82f6' },
  markerLabelContainer: { marginTop: 4, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  markerLabelText: { color: 'white', fontSize: 10, fontWeight: '900' },
  compassContainer: { position: 'absolute', top: 120, right: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  compassText: { color: 'white', fontSize: 10, fontWeight: '900', marginBottom: 2 },
  compassNeedle: { width: 2, height: 12, backgroundColor: '#FF5722' },
  hudOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topHud: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sectorTag: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, borderRadius: 16, borderLeftWidth: 3, borderLeftColor: '#FF5722' },
  sectorText: { color: 'white', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  coordText: { color: '#666', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  bottomHud: { paddingBottom: 110, gap: 16 },
  recenterBtn: { alignSelf: 'flex-end', marginRight: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF5722', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF5722', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.9)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  legendText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  intelModal: { backgroundColor: '#111', padding: 32, borderTopLeftRadius: 40, borderTopRightRadius: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
});
