import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/user-store';
import { useTheme } from '@/hooks/theme';

export default function ConfirmDeleteScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useUser();
  const [status, setStatus] = useState<'working' | 'done' | 'error'>('working');

  useEffect(() => {
    (async () => {
      try {
        // Mark profile as deleted/anonymize (client-safe approach)
        if (user?.id) {
          await supabase.from('profiles').upsert({
            id: user.id,
            display_name: 'Deleted User',
            avatar_url: null,
            is_premium: false,
            goal_calories: 0,
            goal_protein: 0,
            goal_carbs: 0,
            goal_fat: 0,
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any);
        }

        // Clear local data
        await AsyncStorage.clear();

        // Sign out and route to sign-in
        await signOut();
        setStatus('done');
        Alert.alert('Account Deleted', 'Your account has been deleted.');
        router.replace('/sign-in');
      } catch (e) {
        console.log('[ConfirmDelete] error', e);
        setStatus('error');
        Alert.alert('Error', 'Failed to delete account. Please try again later.');
        router.replace('/(tabs)/settings');
      }
    })();
  }, [user, signOut]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Stack.Screen options={{ headerShown: false }} />
      {status === 'working' && (
        <View style={styles.center}> 
          <ActivityIndicator color={theme.colors.primary700} />
          <Text style={[styles.text, { color: theme.colors.textMuted }]}>Deleting your account…</Text>
        </View>
      )}
      {status === 'error' && (
        <View style={styles.center}> 
          <Text style={[styles.text, { color: theme.colors.text }]}>Something went wrong.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  text: { fontSize: 16 },
});
