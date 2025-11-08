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

  // Animation refs
  const pulse = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  
  const particleAnim1 = useRef(new Animated.Value(0)).current;
  const particleAnim2 = useRef(new Animated.Value(0)).current;
  const particleAnim3 = useRef(new Animated.Value(0)).current;
  const particleAnim4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for glow
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );
    loop.start();

    // Particle animations
    [particleAnim1, particleAnim2, particleAnim3, particleAnim4].forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 3500 + (i * 500),
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3500 + (i * 500),
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();
    });

    // Entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: Platform.OS !== 'web',
        }),
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
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start();

    return () => loop.stop();
  }, [pulse, logoScale, logoOpacity, brandOpacity, formOpacity, formTranslateY, particleAnim1, particleAnim2, particleAnim3, particleAnim4]);

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
    } catch (e: unknown) {
      console.error('[SignUp] error', e);
      Alert.alert('Sign up failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, isValid, signUp]);

  const styles = createStyles(theme);

  const particle1Y = particleAnim1.interpolate({ inputRange: [0, 1], outputRange: [-60, 60] });
  const particle2Y = particleAnim2.interpolate({ inputRange: [0, 1], outputRange: [60, -60] });
  const particle3X = particleAnim3.interpolate({ inputRange: [0, 1], outputRange: [-50, 50] });
  const particle4X = particleAnim4.interpolate({ inputRange: [0, 1], outputRange: [50, -50] });

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Animated particles background */}
      <Animated.View style={[styles.particle, { top: '15%', left: '10%', transform: [{ translateY: particle1Y }], opacity: 0.25 }]} />
      <Animated.View style={[styles.particle, { top: '50%', right: '15%', transform: [{ translateY: particle2Y }], opacity: 0.2 }]} />
      <Animated.View style={[styles.particleLarge, { top: '30%', left: '75%', transform: [{ translateX: particle3X }], opacity: 0.15 }]} />
      <Animated.View style={[styles.particleLarge, { bottom: '25%', left: '5%', transform: [{ translateX: particle4X }], opacity: 0.18 }]} />
      <Animated.View style={[styles.particle, { bottom: '15%', right: '8%', transform: [{ translateY: particle1Y }], opacity: 0.22 }]} />

      <View style={styles.center}>
        <View style={styles.glowWrap} pointerEvents="none">
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] }) }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.glow2,
              {
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.2] }) }],
              },
            ]}
          />
        </View>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <Image source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/cvvbh4f5lffvyapplk4fu' }} style={styles.logo} resizeMode="contain" />
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
    root: { flex: 1, backgroundColor: '#0a0a0f', position: 'relative' },
    center: { alignItems: 'center', paddingTop: 56, paddingBottom: 16, zIndex: 10 },
    glowWrap: { position: 'absolute', top: 18, width: '100%', height: 100, alignItems: 'center', justifyContent: 'center' },
    glow: {
      width: 240,
      height: 70,
      borderRadius: 40,
      backgroundColor: '#4A90E2',
      ...Platform.select({
        ios: { shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 30 },
        android: { elevation: 25 },
        web: { filter: 'blur(25px)' },
      }),
    },
    glow2: {
      position: 'absolute',
      width: 280,
      height: 90,
      borderRadius: 50,
      backgroundColor: '#4A90E2',
      ...Platform.select({
        ios: { shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 50 },
        android: { elevation: 35 },
        web: { filter: 'blur(45px)' },
      }),
    },
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
    particle: {
      position: 'absolute',
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#4A90E2',
      zIndex: 1,
      ...Platform.select({ web: { filter: 'blur(25px)' } }),
    },
    particleLarge: {
      position: 'absolute',
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: '#6B5FCD',
      zIndex: 1,
      ...Platform.select({ web: { filter: 'blur(35px)' } }),
    },
  });
