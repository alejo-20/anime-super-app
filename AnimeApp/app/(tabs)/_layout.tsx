import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

type TabIconProps = {
  readonly emoji: string;
  readonly label: string;
  readonly focused: boolean;
  readonly color: string;
};

function TabIcon({ emoji, label, focused, color }: TabIconProps) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.emoji}>{emoji}</Text>
      {focused && <Text style={[styles.tabLabel, { color }]}>{label}</Text>}
    </View>
  );
}

function createTabBarIcon(emoji: string, label: string, color: string) {
  return ({ focused, color: iconColor }: { focused: boolean; color: string }) => (
    <TabIcon emoji={emoji} label={label} focused={focused} color={iconColor} />
  );
}

function createEmojiIcon(emoji: string) {
  return ({ color }: { color: string }) => <Text style={{ color }}>{emoji}</Text>;
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
          tabBarIcon: createEmojiIcon('⚔️'),
        }}
      />
      <Tabs.Screen
        name="saintseiya"
        options={{
          title: 'Saint Seiya',
          tabBarIcon: createTabBarIcon('🛡️', 'Seiya', '#4A90E2'),
        }}
      />
      <Tabs.Screen
        name="hunterxhunter"
        options={{
          title: 'Hunter x Hunter',
          tabBarIcon: createTabBarIcon('🎴', 'HxH', '#E2A84A'),
        }}
      />
      <Tabs.Screen
        name="onepiece"
        options={{
          title: 'One Piece',
          tabBarIcon: createTabBarIcon('☠️', 'One Piece', '#E24A4A'),
        }}
      />
      <Tabs.Screen
        name="naruto"
        options={{
          title: 'Naruto',
          tabBarIcon: createTabBarIcon('🍥', 'Naruto', '#FF6B00'),
        }}
      />
      <Tabs.Screen
        name="resumen"
        options={{
          title: 'Resumen',
          tabBarIcon: createTabBarIcon('📋', 'Resumen', '#9B59B6'),
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
  tabIconFocused: {},
  emoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
