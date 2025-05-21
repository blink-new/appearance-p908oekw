import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { StyleSheet } from 'react-native';
import { ShoppingBag, Shirt, Home } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FF385C',
          tabBarInactiveTintColor: '#777',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Shops',
            tabBarIcon: ({ color }) => <ShoppingBag size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="outfit"
          options={{
            title: 'Outfit',
            tabBarIcon: ({ color }) => <Shirt size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="try-on"
          options={{
            title: 'Try On',
            tabBarIcon: ({ color }) => <Home size={20} color={color} />,
            href: null, // Initially hidden, accessed through outfit builder
          }}
        />
      </Tabs>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});