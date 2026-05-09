import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Activity, 
  AlertCircle, 
  Brain,
  Droplets,
  Wind,
  Thermometer,
  Zap
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { runTriage, TriageInput } from '../services/triage';
import { MotiView } from 'moti';

export default function TriageScreen() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState({
    headache: 0,
    nausea: 0,
    fatigue: 0,
    dizziness: 0,
  });
  const [spo2, setSpo2] = useState(95);
  const [altitude, setAltitude] = useState(3800);

  const updateSymptom = (key: string, val: number) => {
    setSymptoms(prev => ({ ...prev, [key]: val }));
  };

  const triageResult = runTriage({
    headache: symptoms.headache > 0,
    nausea: symptoms.nausea > 0,
    fatigue: symptoms.fatigue > 0,
    dizziness: symptoms.dizziness > 0,
    spo2,
    altitude,
  });

  const riskColor = triageResult.risk === 'HIGH' ? '#FF5722' : triageResult.risk === 'MEDIUM' ? '#FFC107' : '#4CAF50';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MEDICAL TRIAGE</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Risk Card */}
        <MotiView 
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={[styles.riskCard, { borderColor: riskColor }]}
        >
          <Text style={styles.riskLabel}>SYSTEM ASSESSMENT</Text>
          <Text style={[styles.riskValue, { color: riskColor }]}>{triageResult.risk} RISK</Text>
          <Text style={styles.adviceText}>{triageResult.advice}</Text>
          
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>SCORE: {triageResult.score}/15</Text>
          </View>
        </MotiView>

        {/* Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SYMPTOMS (LAKE LOUISE PROTOCOL)</Text>
          
          <SymptomRow 
            icon={<Brain size={20} color="#FF5722" />} 
            label="Headache" 
            value={symptoms.headache} 
            onChange={(v) => updateSymptom('headache', v)} 
          />
          <SymptomRow 
            icon={<Droplets size={20} color="#FF5722" />} 
            label="Nausea" 
            value={symptoms.nausea} 
            onChange={(v) => updateSymptom('nausea', v)} 
          />
          <SymptomRow 
            icon={<Activity size={20} color="#FF5722" />} 
            label="Fatigue" 
            value={symptoms.fatigue} 
            onChange={(v) => updateSymptom('fatigue', v)} 
          />
          <SymptomRow 
            icon={<Wind size={20} color="#FF5722" />} 
            label="Dizziness" 
            value={symptoms.dizziness} 
            onChange={(v) => updateSymptom('dizziness', v)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VITALS & ENVIRONMENT</Text>
          <View style={styles.vitalRow}>
            <View style={styles.vitalInfo}>
              <Zap size={18} color="#2196F3" />
              <Text style={styles.vitalLabel}>SpO2 Level</Text>
            </View>
            <View style={styles.vitalControls}>
              <TouchableOpacity onPress={() => setSpo2(s => Math.max(70, s - 1))} style={styles.controlBtn}><Text style={styles.controlText}>-</Text></TouchableOpacity>
              <Text style={styles.vitalValue}>{spo2}%</Text>
              <TouchableOpacity onPress={() => setSpo2(s => Math.min(100, s + 1))} style={styles.controlBtn}><Text style={styles.controlText}>+</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.alertBox}>
          <AlertCircle size={18} color="#FF5722" />
          <Text style={styles.alertText}>
            This is an offline rule-engine. If symptoms persist, seek professional medical attention at Kaza Hospital.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SymptomRow({ icon, label, value, onChange }: any) {
  return (
    <View style={styles.symptomRow}>
      <View style={styles.symptomLabel}>
        {icon}
        <Text style={styles.symptomText}>{label}</Text>
      </View>
      <View style={styles.symptomOptions}>
        {[0, 1, 2, 3].map((v) => (
          <TouchableOpacity 
            key={v}
            onPress={() => onChange(v)}
            style={[styles.optionBtn, value === v && styles.activeOption]}
          >
            <Text style={[styles.optionText, value === v && styles.activeOptionText]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    gap: 24,
  },
  riskCard: {
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 2,
    borderBottomWidth: 6,
    alignItems: 'center',
    gap: 8,
  },
  riskLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  riskValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  adviceText: {
    color: '#CCC',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    fontWeight: '400',
  },
  scoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  scoreText: {
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  symptomRow: {
    backgroundColor: 'rgba(18, 18, 18, 0.5)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  symptomLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  symptomText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  symptomOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  optionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOption: {
    backgroundColor: '#FF5722',
  },
  optionText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeOptionText: {
    color: '#FFF',
  },
  vitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.5)',
    borderRadius: 20,
    padding: 16,
  },
  vitalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vitalLabel: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  vitalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.2)',
  },
  controlText: {
    color: '#2196F3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  vitalValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
  },
  alertBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255, 87, 34, 0.05)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 34, 0.1)',
  },
  alertText: {
    flex: 1,
    color: '#FF5722',
    fontSize: 11,
    lineHeight: 18,
    fontWeight: '400',
  }
});
