import React from 'react';
import { Tabs } from 'expo-router';
import { Shield, Activity, Map as MapIcon, MessageSquare, AlertTriangle, Compass } from 'lucide-react-native';
import { View, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.blurWrapper}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      </View>
      <View style={styles.tabBarInner}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const Icon = options.tabBarIcon;

          if (route.name === 'sos') {
            return (
              <View key={route.key} style={styles.sosWrapper}>
                <TouchableOpacity
                  onPress={onPress}
                  activeOpacity={0.9}
                  style={styles.sosButton}
                >
                  <MotiView
                    from={{ scale: 1 }}
                    animate={{ scale: isFocused ? 1.1 : 1 }}
                    transition={{ type: 'spring' }}
                  >
                    <AlertTriangle size={30} color="#FFF" />
                  </MotiView>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              <MotiView
                animate={{
                  scale: isFocused ? 1.2 : 1,
                  translateY: isFocused ? -2 : 0,
                }}
                transition={{ type: 'spring', damping: 15 }}
              >
                {Icon && typeof Icon === 'function' ? Icon({ color: isFocused ? '#FF5722' : '#888' }) : null}
              </MotiView>
              {isFocused && (
                <MotiView
                  from={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={styles.activeDot}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }: any) => <Activity size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          tabBarIcon: ({ color }: any) => <Compass size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          tabBarIcon: ({ color }: any) => <MessageSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarIcon: ({ color }: any) => <Shield size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ color }: any) => <MapIcon size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    height: 64,
    // Remove overflow: hidden to allow SOS button to float
  },
  blurWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  tabBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF5722',
    marginTop: 4,
  },
  sosWrapper: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    top: -20, // Adjust this to control how high it floats
  },
  sosButton: {
    width: 60,
    height: 60,
    backgroundColor: '#FF5722',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#0A0A0A',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
});
