import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Theme } from '@/constants/theme';

export default function AuthWelcomeScreen() {
  const goSignup = useCallback(() => {
    router.push('/sign-up');
  }, []);

  const goLogin = useCallback(() => {
    router.push('/log-in');
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View style={styles.overlay} />
      <View style={styles.contentWrap}>
        <Animated.View style={styles.center}>
          <View style={styles.brandWrapper}>
            <Text style={styles.kicker}>Welcome to</Text>
            <Text style={styles.brand} testID="brand-text">FitnexCal</Text>
            <Text style={styles.subtitle}>Your AI-powered nutrition & fitness coach</Text>
          </View>

          <View style={styles.logoWrapper}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/3tf5xha5m2jv5vgyjfs64' }}
              style={styles.logo}
              resizeMode="contain"
              testID="app-logo"
            />
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={goSignup}
            activeOpacity={0.9}
            style={styles.primaryButton}
            testID="cta-signup"
          >
            <Text style={styles.primaryButtonText}>SIGN UP FOR FREE</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goLogin} style={styles.loginLink} testID="cta-login">
            <Text style={styles.loginText}>LOG IN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.92)',
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'web' ? 24 : 32,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandWrapper: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 6,
  },
  kicker: {
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#9CA3AF',
  },
  logo: {
    width: 96,
    height: 96,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F9FAFB',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 260,
  },
  logoWrapper: {
    marginTop: 12,
    width: 140,
    height: 140,
    borderRadius: 40,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.35,
        shadowRadius: 32,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  footer: {
    paddingTop: 4,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loginLink: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  loginText: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '700',
  },
});
