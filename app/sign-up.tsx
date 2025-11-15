import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, Animated, Easing, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { useUser } from '@/hooks/user-store';

export default function SignUpScreen() {
  const { signUp } = useUser();
  const { theme } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Animation refs (logo + brand + form only, aligned with login)
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      Animated.timing(brandOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 550, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(formTranslateY, { toValue: 0, duration: 550, easing: Easing.out(Easing.exp), useNativeDriver: Platform.OS !== 'web' }),
      ]),
    ]).start();
  }, [logoScale, logoOpacity, brandOpacity, formOpacity, formTranslateY]);

  const isValid = useMemo(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email.trim()) && password.trim().length >= 6, [email, password]);

  const onSubmit = useCallback(async () => {
    if (!isValid) {
      Alert.alert('Invalid details', 'Enter a valid email and a 6+ character password.');
      return;
    }
    try {
      setLoading(true);
      await signUp(email.trim().toLowerCase(), password.trim());
      router.replace('/onboarding');
    } catch (e: any) {
      console.error('[SignUp] error', e);
      const msg: string = (typeof e?.message === 'string' ? e.message : '') + ' ' + (typeof e?.error_description === 'string' ? e.error_description : '');
      if (/already\s*registered|already\s*exists|user\s*already|exists\s*\(|23505/i.test(msg)) {
        Alert.alert('Email already registered', 'This email is already in use. Please log in instead.', [
          { text: 'Go to Log In', onPress: () => router.replace('/log-in') },
          { text: 'OK' },
        ]);
      } else {
        Alert.alert('Sign up failed', 'Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, isValid, signUp]);

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.overlay} />

      <View style={styles.center}>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ao6dpw1jgh0i6gq6fseo0' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.View style={{ opacity: brandOpacity }}>
          <Text style={styles.brand}>FitnexCal</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.formCard, { opacity: formOpacity, transform: [{ translateY: formTranslateY }] }]}>
        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            testID="signup-email"
          />
        </View>
        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            testID="signup-password"
          />
        </View>

        <TouchableOpacity
          onPress={onSubmit}
          disabled={loading}
          style={[styles.primaryButton, (!isValid || loading) && styles.disabled]}
          testID="signup-submit"
        >
          <Text style={styles.primaryButtonText}>{loading ? 'PLEASE WAIT…' : 'SIGN UP FOR FREE'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/log-in')} style={styles.linkTouch}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: '#020617', position: 'relative' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.92)' },
    center: { alignItems: 'center', paddingTop: 56, paddingBottom: 16, zIndex: 10 },
    glowWrap: { position: 'absolute', top: 18, width: '100%', height: 100, alignItems: 'center', justifyContent: 'center' },
    glow: { width: 230, height: 70, borderRadius: 40, backgroundColor: '#4A90E2' },
    glow2: { position: 'absolute', width: 260, height: 90, borderRadius: 50, backgroundColor: '#4A90E2' },
    logo: { width: 100, height: 100, marginBottom: 12 },
    brand: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', letterSpacing: 0.5 },
    formCard: { flex: 1, paddingTop: 32, paddingHorizontal: 20, zIndex: 10 },
    inputWrap: {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
      marginBottom: 14,
      borderWidth: 1.5,
      borderColor: 'rgba(74, 144, 226, 0.2)',
    },
    input: { color: '#FFFFFF', fontSize: 16 },
    primaryButton: {
      backgroundColor: '#4A90E2',
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      ...Platform.select({
        ios: { shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
        android: { elevation: 8 },
        web: { boxShadow: '0 4px 20px rgba(74, 144, 226, 0.4)' },
      }),
    },
    primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.6 },
    disabled: { opacity: 0.5 },
    linkTouch: { alignItems: 'center', paddingVertical: 20 },
    linkText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 15, fontWeight: '600' },
    particle: {},
    particleLarge: {},
  });
