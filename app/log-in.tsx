import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { useUser } from '@/hooks/user-store';

export default function LogInScreen() {
  const { signIn } = useUser();
  const { theme } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1800, easing: Easing.in(Easing.quad), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const isValid = useMemo(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email.trim()) && password.trim().length >= 6, [email, password]);

  const onSubmit = useCallback(async () => {
    const emailSan = email.trim().toLowerCase();
    const pass = password.trim();
    if (!isValid) {
      Alert.alert('Invalid credentials', 'Enter a valid email and a 6+ character password.');
      return;
    }
    try {
      setLoading(true);
      await signIn(emailSan, pass);
      router.replace('/');
    } catch (e: unknown) {
      console.error('[LogIn] error', e);
      Alert.alert('Login failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, isValid, signIn]);

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.center}>
        <View style={styles.glowWrap} pointerEvents="none">
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] }),
                transform: [
                  {
                    scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.1] }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Image source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/erlrdcwaclcficyu15p5z' }} style={styles.logo} resizeMode="contain" accessibilityLabel="FitnexCal logo" testID="login-logo" />
        <Text style={styles.brand}>FitnexCal</Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={theme.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            testID="login-email"
          />
        </View>
        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Password"
            placeholderTextColor={theme.colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            testID="login-password"
          />
        </View>

        <TouchableOpacity
          onPress={onSubmit}
          disabled={loading}
          style={[styles.primaryButton, (!isValid || loading) && styles.disabled]}
          testID="login-submit"
        >
          <Text style={styles.primaryButtonText}>{loading ? 'PLEASE WAIT…' : 'LOG IN'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/sign-up')} style={styles.linkTouch}>
          <Text style={styles.linkText}>Create an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    center: { alignItems: 'center', paddingTop: 48, paddingBottom: 8 },
    glowWrap: { position: 'absolute', top: 10, width: '100%', height: 72, alignItems: 'center', justifyContent: 'center' },
    glow: { width: 220, height: 60, borderRadius: 32, backgroundColor: theme.colors.primary },
    logo: { width: 92, height: 92, marginBottom: 8 },
    brand: { color: theme.colors.text, fontSize: 28, fontWeight: '800' },
    formCard: { flex: 1, paddingTop: 24, paddingHorizontal: 20 },
    inputWrap: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    input: { color: theme.colors.text, fontSize: 16 },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
    },
    primaryButtonText: { color: theme.colors.text, fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
    disabled: { opacity: 0.6 },
    linkTouch: { alignItems: 'center', paddingVertical: 18 },
    linkText: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  });
