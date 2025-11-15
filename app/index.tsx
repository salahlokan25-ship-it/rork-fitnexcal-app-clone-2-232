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

  // Simplified, professional intro animation
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(16)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;

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
    // Slightly longer, smoother intro so the splash doesn't disappear too fast
    const animDuration = Platform.OS === 'web' ? 500 : 900;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: animDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: animDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: animDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      Animated.delay(Platform.OS === 'web' ? 500 : 800),
    ]).start(() => {
      console.log('[IndexScreen] Animation complete, setting states');
      setShowSplash(false);
      setAnimationComplete(true);
    });
  }, [isLoading, introSeen, titleOpacity, titleTranslateY, logoOpacity, logoScale]);

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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {showSplash ? (
        <View style={styles.splashRoot} testID="splash-root">
          <View style={styles.splashOverlay} />
          <View style={styles.splashCenter}>
            <Animated.View
              style={[
                styles.brandWrapper,
                {
                  opacity: titleOpacity,
                  transform: [{ translateY: titleTranslateY }],
                },
              ]}
              testID="splash-brand-wrapper"
            >
              <Text style={styles.splashTitle}>FitnexCal</Text>
              <Text style={styles.splashSubtitle}>Your AI-powered nutrition & fitness coach</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.logoWrapper,
                {
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }],
                },
              ]}
              testID="splash-logo-wrapper"
            >
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
    backgroundColor: '#020617',
    position: 'relative',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.85)',
  },
  splashCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  brandWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  splashTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#F9FAFB',
    letterSpacing: 0.6,
  },
  splashSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
  },
  logoWrapper: {
    width: 160,
    height: 160,
    borderRadius: 48,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.35,
        shadowRadius: 40,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 32,
  },
});