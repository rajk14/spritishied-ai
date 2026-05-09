import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { Shield, Radio, Cpu, ChevronRight, Activity } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const PAGES = [
  {
    title: 'THE EDGE\nOF SURVIVAL',
    desc: '14,000 FEET.\nNO INTERNET.\nMEDICAL EMERGENCY.\n\nAI STILL WORKS.',
    icon: <Activity size={100} color="#f43f5e" />,
    color: '#f43f5e',
    accent: '#2e0000'
  },
  {
    title: 'SURVIVAL\nINTELLIGENCE',
    desc: 'Local-first AI trained for Himalayan emergencies. 100% offline medical and route guidance.',
    icon: <Cpu size={100} color="#FF5722" />,
    color: '#FF5722',
    accent: '#3E1000'
  },
  {
    title: 'MESH\nNETWORKING',
    desc: 'Stay connected even with zero signal. Broadcast SOS and alerts to nearby local nodes.',
    icon: <Radio size={100} color="#2196F3" />,
    color: '#2196F3',
    accent: '#001A3E'
  },
  {
    title: 'SHIELD\nPROTOCOL',
    desc: 'Your tactical companion for the cold desert. Secured, localized, and always ready.',
    icon: <Shield size={100} color="#4CAF50" />,
    color: '#4CAF50',
    accent: '#002C13'
  }
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  const next = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (index < PAGES.length - 1) {
      setIndex(index + 1);
    } else {
      await SecureStore.setItemAsync('onboarding_complete', 'true');
      router.replace('/auth');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <LinearGradient
        colors={[PAGES[index].accent, '#000', '#000']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Background Tech UI Decorations */}
      <MotiView 
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ loop: true, duration: 4000 }}
        style={styles.gridOverlay} 
      />
      
      <MotiView 
        from={{ translateY: -height }}
        animate={{ translateY: height }}
        transition={{ loop: true, duration: 5000, type: 'timing' }}
        style={[styles.scannerLine, { backgroundColor: PAGES[index].color + '40' }]}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <MotiView
            key={index}
            from={{ opacity: 0, scale: 0.8, translateY: 40 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            style={styles.page}
          >
              <View style={styles.iconContainer}>
                <MotiView
                  from={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 200, type: 'spring' }}
                  style={[styles.iconBlur, { backgroundColor: PAGES[index].color + '20', borderColor: PAGES[index].color + '40' }]}
                >
                  <MotiView
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ loop: true, duration: 2000 }}
                  >
                    {PAGES[index].icon}
                  </MotiView>
                </MotiView>
                
                {/* Tactical HUD Elements */}
                <View style={styles.hudElement}>
                  <Activity size={12} color={PAGES[index].color} />
                  <Text style={[styles.hudText, { color: PAGES[index].color }]}>CRYPTO_ACTIVE</Text>
                </View>
              </View>

              <View style={{ gap: 16, alignItems: 'center' }}>
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 300 }}
                >
                  <Text style={styles.title}>{PAGES[index].title}</Text>
                </MotiView>
                
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 450 }}
                >
                  <Text style={styles.desc}>{PAGES[index].desc}</Text>
                </MotiView>
              </View>
            </MotiView>

          <View style={styles.footer}>
            <View style={styles.indicators}>
              {PAGES.map((_, i) => (
                <View 
                  key={i} 
                  style={[styles.dot, index === i && { backgroundColor: PAGES[index].color, width: 32 }]} 
                />
              ))}
            </View>
            
            <TouchableOpacity 
              onPress={next}
              activeOpacity={0.8}
              style={[styles.nextBtn, { backgroundColor: PAGES[index].color, shadowColor: PAGES[index].color }]}
            >
              <ChevronRight size={36} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 32, justifyContent: 'center' },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
    opacity: 0.2,
  },
  scannerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    zIndex: 1,
  },
  page: { alignItems: 'center', gap: 48 },
  iconContainer: { alignItems: 'center', gap: 16 },
  iconBlur: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  hudElement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hudText: {
    fontSize: 9,
    fontWeight: 'black',
    letterSpacing: 2,
  },
  title: {
    color: 'white',
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 52,
    letterSpacing: -1,
  },
  desc: {
    color: '#CCC',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '400', // Clean body text
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicators: { flexDirection: 'row', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#222' },
  nextBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  }
});
