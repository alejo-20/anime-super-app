import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ emoji, label, focused, color }: {
  readonly emoji: string;
  readonly label: string;
  readonly focused: boolean;
  readonly color: string;
}) {
  return (
    <View style={styles.tabIcon}>
      <Text style={styles.emoji}>{emoji}</Text>
      {focused && <Text style={[styles.tabLabel, { color }]}>{label}</Text>}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#555',
        tabBarShowLabel: false,
        headerStyle: { backgroundColor: '#0f0f1a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen
        name="mis-personajes"
        options={{
          title: 'Mis personajes',
          tabBarIcon: ({ color }) => (
            <Text style={{ color: color as string }}>⚔️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="saintseiya"
        options={{
          title: 'Saint Seiya',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🛡️" label="Seiya" focused={focused} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="hunterxhunter"
        options={{
          title: 'Hunter x Hunter',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🎴" label="HxH" focused={focused} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="onepiece"
        options={{
          title: 'One Piece',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="☠️" label="One Piece" focused={focused} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="naruto"
        options={{
          title: 'Naruto',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🍥" label="Naruto" focused={focused} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="resumen"
        options={{
          title: 'Resumen',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="📋" label="Resumen" focused={focused} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1a1a2e',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  emoji: { fontSize: 22 },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});