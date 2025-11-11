import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { useSleep } from '@/hooks/sleep-store';
import { ArrowLeft } from 'lucide-react-native';

export default function TrackSleepHistoryScreen() {
  const { theme } = useTheme();
  const { getSleepHistory } = useSleep();
  const history = getSleepHistory(14);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 16, gap: 12 },
    card: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    date: { color: theme.colors.text, fontWeight: '700' },
    hours: { color: theme.colors.textMuted, fontWeight: '600' },
    empty: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 24 },
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Sleep History',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { color: theme.colors.text, fontWeight: '700' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 16 }}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {history.length === 0 ? (
          <Text style={styles.empty}>No sleep logs yet</Text>
        ) : (
          history.map((entry, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.date}>{entry.date}</Text>
              <Text style={styles.hours}>{entry.hours.toFixed(1)} h</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
