import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Fingerprint, Lock, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

export default function AuthScreen() {
  const [meshId, setMeshId] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.container}>
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="items-center mb-16"
          >
            <View className="bg-primary/10 p-2 rounded-[40px] border border-primary/20">
              <Image 
                source={{ uri: 'file:///C:/Users/rajsi/.gemini/antigravity/brain/ea107179-bfcd-470f-aa9c-e5ff615306fe/spitishield_logo_1778226434132.png' }}
                style={{ width: 100, height: 100, borderRadius: 24 }}
              />
            </View>
            <Text className="text-white text-3xl font-black mt-6">SPITI<Text className="text-primary">SHIELD</Text></Text>
            <Text className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Tactical Survival OS v4.0</Text>
          </MotiView>

          <MotiView
            from={{ translateY: 50, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ delay: 300 }}
            className="gap-6"
          >
            <View className="gap-2">
              <Text className="text-gray-500 text-[10px] font-black uppercase ml-4">Mesh Identity</Text>
              <BlurView intensity={10} tint="dark" style={styles.inputWrapper}>
                <Lock size={18} color="#444" style={{ marginLeft: 16 }} />
                <TextInput 
                  placeholder="Enter Mesh-ID or Callsign..."
                  placeholderTextColor="#333"
                  className="flex-1 px-4 py-5 text-white font-bold"
                  value={meshId}
                  onChangeText={setMeshId}
                />
              </BlurView>
            </View>

            <TouchableOpacity 
              onPress={handleLogin}
              className="bg-primary p-6 rounded-3xl flex-row items-center justify-between shadow-xl shadow-primary/40"
            >
              <View className="flex-row items-center gap-4">
                <Fingerprint size={24} color="white" />
                <Text className="text-white font-black text-lg">INITIALIZE MESH</Text>
              </View>
              <ChevronRight size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity className="items-center mt-4">
              <Text className="text-gray-600 font-bold text-xs">RECOVER ENCRYPTION KEYS</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 32, justifyContent: 'center' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  }
});
