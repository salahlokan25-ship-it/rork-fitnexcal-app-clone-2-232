import { Tabs } from 'expo-router';
import { Home, Camera, Search, MessageCircle, Settings, Plus, Heart, Brain } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/theme';

function CustomTabBar({ state, descriptors, navigation }: any) {
  console.log('[CustomTabBar] render', { index: state.index, routes: state.routes.map((r: any) => r.name) });
  const { theme } = useTheme();
  const styles = stylesWithTheme(theme);

  return (
    <View style={styles.tabBarContainer} testID="custom-tab-bar">
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label: string =
          options.tabBarLabel !== undefined
            ? (options.tabBarLabel as string)
            : options.title !== undefined
            ? (options.title as string)
            : (route.name as string);

        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        // default styles for regular tabs
        const inactiveText = 'rgba(255,255,255,0.9)';
        const activeText = '#FFFFFF';
        const color = isFocused ? activeText : inactiveText;
        const iconSize = 22 as const;
        const Icon = options.tabBarIcon as
          | ((props: { color: string; size: number }) => React.ReactNode)
          | undefined;

        if (route.name === 'scan') {
          const centerActiveColor = '#FFFFFF' as const;
          return (
            <View key={route.key} style={styles.centerSlot}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                testID="tab-item-scan"
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.centerButtonWrapper}
              >
                <View style={styles.centerButton}>
                  <Plus color={centerActiveColor} size={30} />
                </View>
                <Text style={styles.centerLabel}>Scan</Text>
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={`tab-item-${route.name}`}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItemWrapper}
          >
            <View style={[styles.pill, isFocused ? styles.pillActive : styles.pillInactive]}>
              <View style={styles.iconWrapper}>
                {Icon ? Icon({ color, size: iconSize }) : null}
              </View>
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function RootLayoutNav() {
  const screenOptions = useMemo(() => {
    return {
      headerShown: false,
      tabBarShowLabel: true,
    } as const;
  }, []);

  return (
    <Tabs screenOptions={screenOptions} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="wellness"
        options={{
          title: 'Wellness',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="mind"
        options={{
          title: 'Mindfulness',
          tabBarIcon: ({ color, size }) => <Brain color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => <Camera color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="research"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const stylesWithTheme = (Theme: any) => StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: Theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 10,
  },
  tabItemWrapper: {
    flex: 1,
    paddingHorizontal: 4,
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 64,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  centerLabel: {
    marginTop: 4,
    color: Theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  pill: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  pillActive: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  pillInactive: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  iconWrapper: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.95,
  },
});

export default function TabLayout() {
  return <RootLayoutNav />;
}
