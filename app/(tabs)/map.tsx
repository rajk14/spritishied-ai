import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { 
  Search, 
  Navigation, 
  Zap, 
  WifiOff,
  Layers,
  Hospital,
  Droplet,
  Fuel,
  Radio,
  Globe,
  Activity,
  UserCircle
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import MapView, { Marker, UrlTile, Polyline } from 'react-native-maps';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { journeyManager } from '../../services/journey';

const ESRI_SATELLITE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const KAZA_REGION = {
  latitude: 32.2276,
  longitude: 78.0707,
  latitudeDelta: 2.0, // Zoom out to see the whole route
  longitudeDelta: 2.0,
};

const { width, height } = Dimensions.get('window');

// Mock data for Spiti relative to center (Kaza)
const MESH_NODES = [
  { id: 'hosp1', title: 'Kaza Hospital', type: 'medical', x: 40, y: -60, icon: <Hospital size={16} color="#FFF" /> },
  { id: 'oxy1', title: 'Losar O2 Point', type: 'oxygen', x: -80, y: -120, icon: <Droplet size={16} color="#FFF" /> },
  { id: 'fuel1', title: 'Indian Oil', type: 'utility', x: 20, y: 50, icon: <Fuel size={16} color="#FFF" /> },
  { id: 'sos1', title: 'Distress Beacon', type: 'alert', x: -50, y: 80, icon: <Radio size={16} color="#FFF" /> },
];

const ROUTE_COORDS: Record<string, { lat: number; lng: number }> = {
  del: { lat: 28.6139, lng: 77.2090 },
  shi: { lat: 31.1048, lng: 77.1734 },
  kal: { lat: 31.5300, lng: 78.2700 },
  ran: { lat: 32.2276, lng: 78.0707 },
  nar: { lat: 31.2500, lng: 77.4500 },
};

export default function OfflineMapScreen() {
  const [isScanning, setIsScanning] = useState(true);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'mesh'>('mesh');
  const [stops, setStops] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = !!(state.isConnected && state.isInternetReachable);
      setIsOnline(online);
    });
    return () => unsubscribe();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setStops(journeyManager.getStops());
    }, [])
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsScanning(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {mapType === 'mesh' ? (
        <>
          {/* 100% OFFLINE GRID BACKGROUND */}
          <View style={styles.gridOverlay}>
            {[...Array(20)].map((_, i) => (
              <View key={`v-${i}`} style={[styles.gridLineVertical, { left: i * (width / 10) }]} />
            ))}
            {[...Array(30)].map((_, i) => (
              <View key={`h-${i}`} style={[styles.gridLineHorizontal, { top: i * (width / 10) }]} />
            ))}
          </View>

          {/* RADAR SWEEP ANIMATION */}
          {isScanning && (
            <MotiView
              from={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ type: 'timing', duration: 2000, loop: true }}
              style={styles.radarSweep}
            />
          )}

          {/* CENTER USER POSITION */}
          <View style={styles.centerNode}>
            <MotiView
              from={{ scale: 0.8 }}
              animate={{ scale: 1.2 }}
              transition={{ type: 'spring', loop: true }}
            >
              <View style={styles.userDot} />
            </MotiView>
            <View style={styles.userPulse} />
          </View>

          {/* PLOT MESH NODES */}
          {!isScanning && MESH_NODES.map((node, index) => (
            <MotiView
              key={node.id}
              from={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: index * 100 }}
              style={[styles.meshNode, { left: (width / 2) + node.x, top: (height / 2) + node.y }]}
            >
              <TouchableOpacity 
                onPress={() => alert(`Node: ${node.title}\nStatus: Online\nDistance: ${Math.abs(node.x + node.y) / 10}km`)}
                className="items-center"
              >
                <View style={[styles.nodeIcon, node.type === 'alert' ? { backgroundColor: '#FF5722' } : { backgroundColor: '#2196F3' }]}>
                  {node.icon}
                </View>
                <Text style={styles.nodeTitle}>{node.title}</Text>
                <Text style={styles.nodeDistance}>{Math.abs(node.x + node.y) / 10} km</Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </>
      ) : (
        <MapView
          style={StyleSheet.absoluteFill}
          mapType="standard"
          initialRegion={KAZA_REGION}
          customMapStyle={darkMapStyle}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={true}
          moveOnMarkerPress={true}
        >
          {/* ESRI SATELLITE TILE OVERLAY (API KEY FREE) */}
          <UrlTile
            urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maximumZ={19}
            flipY={false}
            tileSize={256}
            zIndex={10}
          />

          {/* RENDER JOURNEY ROUTE */}
          <Polyline 
            coordinates={stops.map(s => ({
              latitude: ROUTE_COORDS[s.id]?.lat || KAZA_REGION.latitude,
              longitude: ROUTE_COORDS[s.id]?.lng || KAZA_REGION.longitude
            }))}
            strokeColor="#FF5722"
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />

          {stops.map((stop) => (
            <Marker
              key={stop.id}
              coordinate={{ 
                latitude: ROUTE_COORDS[stop.id]?.lat || KAZA_REGION.latitude, 
                longitude: ROUTE_COORDS[stop.id]?.lng || KAZA_REGION.longitude 
              }}
              title={stop.name}
              description={`${stop.alt}m ASL - ${stop.status.toUpperCase()}`}
            >
              <View style={[
                styles.nodeIcon, 
                stop.status === 'complete' ? { backgroundColor: '#4CAF50' } : 
                stop.status === 'current' ? { backgroundColor: '#FF5722' } : 
                { backgroundColor: '#333' },
                { width: 20, height: 20 }
              ]}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' }} />
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {/* UI OVERLAY */}
      <SafeAreaView style={styles.uiContainer} pointerEvents="box-none">
        <View style={styles.header} pointerEvents="box-none">
          <BlurView intensity={20} tint="dark" style={styles.searchBar}>
            <Search size={18} color="#888" />
            <TextInput 
              placeholder="Search terrain..." 
              placeholderTextColor="#888"
              style={styles.searchInput}
            />
          </BlurView>
          
          <View style={styles.chipContainer}>
            <TouchableOpacity 
              onPress={() => setMapType('mesh')}
              style={[styles.chip, mapType === 'mesh' && styles.activeChip]}
            >
              <Radio size={12} color={mapType === 'mesh' ? "#000" : "#FFF"} />
              <Text style={mapType === 'mesh' ? styles.activeChipText : styles.chipText}>MESH RADAR</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setMapType('satellite')}
              style={[styles.chip, mapType === 'satellite' && styles.activeChip]}
            >
              <Layers size={12} color={mapType === 'satellite' ? "#000" : "#FFF"} />
              <Text style={mapType === 'satellite' ? styles.activeChipText : styles.chipText}>SATELLITE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sideButtons}>
          <TouchableOpacity style={styles.sideButton}>
            <Layers size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomCard} pointerEvents="box-none">
          <View style={styles.statusBox}>
            <View style={styles.statusHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.offlineBadge}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isOnline ? '#4CAF50' : '#FF5722', marginRight: 6 }} />
                  <Text style={[styles.offlineText, { color: isOnline ? '#4CAF50' : '#FF5722' }]}>
                    {isOnline ? 'GLOBAL SAT-LINK ACTIVE' : 'LOCAL MESH ACTIVE'}
                  </Text>
                </View>
                <Text style={styles.regionTitle}>Spiti {isOnline ? 'Live Grid' : 'Offline Sector'}</Text>
              </View>
              <View style={styles.gpsBadge}>
                <Navigation size={12} color="#2196F3" />
                <Text style={styles.gpsText}>GPS LOCK</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              onPress={() => alert(isOnline ? "Fetching latest survival telemetry..." : "Using local cached data")}
              style={styles.routeButton} 
              activeOpacity={0.8}
            >
              <View style={[styles.routeIcon, isOnline ? { backgroundColor: 'rgba(33, 150, 243, 0.1)' } : {}]}>
                {isOnline ? <Globe size={16} color="#2196F3" /> : <Zap size={16} color="#FF5722" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.routeTitle, isOnline ? { color: '#2196F3' } : {}]}>
                  {isOnline ? 'SYNCING TELEMETRY' : 'NEAREST SAFE ZONE'}
                </Text>
                <Text style={styles.routeSub}>
                  {isOnline ? 'Real-time regional hazards active' : 'Kaza Hospital • 2.4km'}
                </Text>
              </View>
              {isOnline ? <Activity size={20} color="#2196F3" /> : <Navigation size={20} color="#444" style={{ transform: [{ rotate: '45deg' }] }} />}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  gridLineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: '#2196F3',
  },
  gridLineHorizontal: {
    position: 'absolute',
    height: 1,
    width: '100%',
    backgroundColor: '#2196F3',
  },
  radarSweep: {
    position: 'absolute',
    top: height / 2 - 100,
    left: width / 2 - 100,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  centerNode: {
    position: 'absolute',
    top: height / 2 - 12,
    left: width / 2 - 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: {
    width: 12,
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    zIndex: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  userPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  meshNode: {
    position: 'absolute',
    alignItems: 'center',
    width: 80,
    marginLeft: -40,
    marginTop: -20,
  },
  nodeIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  nodeTitle: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nodeDistance: {
    color: '#4CAF50',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
  },
  uiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  header: {
    padding: 16,
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    marginLeft: 12,
    fontSize: 14,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeChip: {
    backgroundColor: '#FFF',
  },
  chipText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  activeChipText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  sideButtons: {
    position: 'absolute',
    right: 16,
    top: '40%',
    alignItems: 'center',
  },
  sideButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  bottomCard: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
    padding: 16,
  },
  statusBox: {
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  offlineText: {
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 4,
  },
  regionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gpsBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  gpsText: {
    color: '#2196F3',
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  routeButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  routeIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  routeTitle: {
    color: '#FF5722',
    fontSize: 11,
    fontWeight: '900',
  },
  routeSub: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
