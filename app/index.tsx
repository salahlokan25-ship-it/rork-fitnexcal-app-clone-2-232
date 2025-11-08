import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Text, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useUser } from '@/hooks/user-store';
import { Theme } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndexScreen() {
  const { isLoading, hasCompletedOnboarding, user, isAuthenticated } = useUser();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);

  const textScale = useRef<Animated.Value>(new Animated.Value(0.5)).current;
  const textOpacity = useRef<Animated.Value>(new Animated.Value(0)).current;
  const textGlow = useRef<Animated.Value>(new Animated.Value(0)).current;

  const logoOpacity = useRef<Animated.Value>(new Animated.Value(0)).current;
  const logoScale = useRef<Animated.Value>(new Animated.Value(0.3)).current;
  const logoRotate = useRef<Animated.Value>(new Animated.Value(0)).current;
  const logoGlow = useRef<Animated.Value>(new Animated.Value(0)).current;
  
  const particleAnim1 = useRef<Animated.Value>(new Animated.Value(0)).current;
  const particleAnim2 = useRef<Animated.Value>(new Animated.Value(0)).current;
  const particleAnim3 = useRef<Animated.Value>(new Animated.Value(0)).current;

  // Check intro_seen flag on mount
  useEffect(() => {
    const checkIntroSeen = async () => {
      try {
        const seen = await AsyncStorage.getItem('intro_seen');
        console.log('[IndexScreen] intro_seen:', seen);
        setIntroSeen(seen === 'true');
      } catch (error) {
        console.error('[IndexScreen] Error checking intro_seen:', error);
        setIntroSeen(false);
      }
    };
    checkIntroSeen();
  }, []);

  // Run splash animation
  useEffect(() => {
    if (isLoading || introSeen === null) {
      console.log('[IndexScreen] Waiting to start animation:', { isLoading, introSeen });
      return;
    }

    console.log('[IndexScreen] Starting splash animation');

    // Start particle animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim1, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(particleAnim1, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim2, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(particleAnim2, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim3, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(particleAnim3, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();

    // Main splash sequence with wow effects
    const animDuration = Platform.OS === 'web' ? 400 : 800;
    
    Animated.sequence([
      // Phase 1: Text appears with glow
      Animated.parallel([
        Animated.spring(textScale, {
          toValue: 1.1,
          friction: 4,
          tension: 40,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: animDuration,
          easing: Easing.out(Easing.exp),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(textGlow, {
          toValue: 1,
          duration: animDuration * 1.5,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      Animated.delay(Platform.OS === 'web' ? 300 : 500),
      // Phase 2: Text fades and logo appears with dramatic effect
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: animDuration / 2,
          easing: Easing.in(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(textGlow, {
          toValue: 0,
          duration: animDuration / 2,
          easing: Easing.in(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: animDuration,
          easing: Easing.out(Easing.exp),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: animDuration * 1.2,
          easing: Easing.out(Easing.exp),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(logoGlow, {
          toValue: 1,
          duration: animDuration * 1.5,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      Animated.delay(Platform.OS === 'web' ? 400 : 800),
    ]).start(() => {
      console.log('[IndexScreen] Animation complete, setting states');
      setShowSplash(false);
      setAnimationComplete(true);
    });
  }, [isLoading, introSeen, textOpacity, textScale, textGlow, logoOpacity, logoScale, logoRotate, logoGlow, particleAnim1, particleAnim2, particleAnim3]);

  // Navigate after animation completes
  useEffect(() => {
    if (!animationComplete || introSeen === null) {
      console.log('[IndexScreen] Waiting for animation/data:', { animationComplete, introSeen });
      return;
    }

    console.log('[IndexScreen] Navigation decision:', { introSeen, isAuthenticated, hasCompletedOnboarding });

    if (!introSeen) {
      console.log('[IndexScreen] Navigating to /intro');
      router.replace('/intro');
      return;
    }
    if (!isAuthenticated) {
      console.log('[IndexScreen] Navigating to /sign-in');
      router.replace('/sign-in');
      return;
    }
    if (!hasCompletedOnboarding) {
      console.log('[IndexScreen] Navigating to /onboarding');
      router.replace('/onboarding');
    } else {
      console.log('[IndexScreen] Navigating to /(tabs)/home');
      // Returning users skip quiz and go straight to the plan (Home)
      router.replace('/(tabs)/home');
    }
  }, [animationComplete, introSeen, isAuthenticated, hasCompletedOnboarding]);

  const rotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-20deg', '0deg'],
  });

  const textGlowOpacity = textGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const logoGlowOpacity = logoGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.9],
  });

  const particle1Y = particleAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 50],
  });

  const particle2Y = particleAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [50, -50],
  });

  const particle3X = particleAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 40],
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {showSplash ? (
        <View style={styles.splashRoot} testID="splash-root">
          {/* Animated particles in background */}
          <Animated.View style={[styles.particle, { top: '20%', left: '15%', transform: [{ translateY: particle1Y }], opacity: 0.3 }]} />
          <Animated.View style={[styles.particle, { top: '60%', right: '20%', transform: [{ translateY: particle2Y }], opacity: 0.25 }]} />
          <Animated.View style={[styles.particle, { top: '40%', left: '70%', transform: [{ translateX: particle3X }], opacity: 0.2 }]} />
          <Animated.View style={[styles.particleLarge, { top: '15%', right: '10%', transform: [{ translateY: particle2Y }], opacity: 0.15 }]} />
          <Animated.View style={[styles.particleLarge, { bottom: '20%', left: '10%', transform: [{ translateX: particle3X }], opacity: 0.2 }]} />

          <View style={styles.splashCenter}>
            {/* Text with glow effect */}
            <Animated.View
              style={{
                position: 'absolute',
                opacity: textOpacity,
                transform: [{ scale: textScale }],
              }}
              testID="splash-brand-wrapper"
            >
              {/* Glow layers */}
              <Animated.View style={[styles.textGlow, { opacity: textGlowOpacity }]}>
                <Text style={[styles.splashText, styles.glowText]}>FitnexCal</Text>
              </Animated.View>
              <Animated.View style={[styles.textGlow2, { opacity: textGlowOpacity }]}>
                <Text style={[styles.splashText, styles.glowText]}>FitnexCal</Text>
              </Animated.View>
              <Text style={styles.splashText} accessibilityRole="header" testID="splash-brand">FitnexCal</Text>
            </Animated.View>

            {/* Logo with glow effect */}
            <Animated.View
              style={{
                opacity: logoOpacity,
                transform: [{ scale: logoScale }, { rotate: rotateInterpolate }],
              }}
              testID="splash-logo-wrapper"
            >
              {/* Logo glow layers */}
              <Animated.View style={[styles.logoGlow, { opacity: logoGlowOpacity }]} />
              <Animated.View style={[styles.logoGlow2, { opacity: logoGlowOpacity }]} />
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ao6dpw1jgh0i6gq6fseo0' }}
                style={styles.logo}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            </Animated.View>
          </View>
        </View>
      ) : (
        <SafeAreaView style={styles.container}>
          <View style={[styles.content, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text>Loading…</Text>
          </View>
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
  },
  splashRoot: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    position: 'relative',
  },
  splashCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  splashText: {
    fontSize: 42,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  glowText: {
    color: '#4A90E2',
  },
  textGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
      web: {
        filter: 'blur(20px)',
      },
    }),
  },
  textGlow2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 40,
      },
      android: {
        elevation: 30,
      },
      web: {
        filter: 'blur(40px)',
      },
    }),
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 30,
  },
  logoGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: '#4A90E2',
    borderRadius: 50,
    ...Platform.select({
      ios: {
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
      },
      android: {
        elevation: 25,
      },
      web: {
        filter: 'blur(30px)',
      },
    }),
  },
  logoGlow2: {
    position: 'absolute',
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,
    backgroundColor: '#4A90E2',
    borderRadius: 70,
    ...Platform.select({
      ios: {
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 50,
      },
      android: {
        elevation: 35,
      },
      web: {
        filter: 'blur(50px)',
      },
    }),
  },
  particle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    ...Platform.select({
      web: {
        filter: 'blur(20px)',
      },
    }),
  },
  particleLarge: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6B5FCD',
    ...Platform.select({
      web: {
        filter: 'blur(30px)',
      },
    }),
  },
});