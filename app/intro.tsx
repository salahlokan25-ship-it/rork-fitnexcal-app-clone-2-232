import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/theme';
import { useUser } from '@/hooks/user-store';
import { Camera, BarChart3, Target, Bot } from 'lucide-react-native';

const INTRO_SEEN_KEY = 'intro_seen';

export default function IntroScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isAuthenticated } = useUser();

  const handleStart = useCallback(async () => {
    try {
      await AsyncStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch {}
    router.replace('/subscription' as any);
  }, [isAuthenticated]);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBt_AwgjNsCiJ0yt4y3V_16IwGKF6v2PdnOH1Kxo7iP8dKq7K6zYgRPp-m_TbXsu6uYrEPswbdt6Yp8x1OkHThxl_ZEtlcjPks26jCBDIGSGeQV9O9gfGdpKpl29nmv3kHs1-LhXm5AkNqx9uViukioKOc1wTSZdwOZFNksZSNmrPlSCuofGCvhJM1qCQ-9n2a8Wc2z7iaGuvMCoAvDW6de7zgSNViT0HnyDOYIxEimcKYZIHi1UtLeE3cHGfPcteE1v5tS5HWDRXkI' }}
            style={styles.hero}
            imageStyle={styles.heroImg}
            resizeMode="cover"
            accessibilityLabel="Abstract visualization of AI interacting with healthy food"
          />
        </View>

        <View style={styles.dotsRow}>
          <View style={[styles.dot, { backgroundColor: '#007AFF', width: 20 }]} />
          <View style={[styles.dot, { backgroundColor: 'rgba(0,122,255,0.3)' }]} />
          <View style={[styles.dot, { backgroundColor: 'rgba(0,122,255,0.3)' }]} />
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          Your Smart Nutrition Assistant
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Effortless calorie tracking powered by AI, designed to help you reach your health goals faster.
        </Text>

        <View style={styles.cards}>
          <FeatureCard
            icon={Camera}
            title="AI Food Recognition"
            subtitle="Simply snap a photo to log your meals."
            themeColors={{ text: theme.colors.text, muted: theme.colors.textMuted, surface: theme.colors.surface, border: theme.colors.border }}
          />
          <FeatureCard
            icon={BarChart3}
            title="Personalized Insights"
            subtitle="Receive AI-driven advice based on your habits."
            themeColors={{ text: theme.colors.text, muted: theme.colors.textMuted, surface: theme.colors.surface, border: theme.colors.border }}
          />
          <FeatureCard
            icon={Target}
            title="Smart Goal Setting"
            subtitle="Let our AI help you set and adjust realistic goals."
            themeColors={{ text: theme.colors.text, muted: theme.colors.textMuted, surface: theme.colors.surface, border: theme.colors.border }}
          />
          <FeatureCard
            icon={Bot}
            title="Your Personal AI Coach"
            subtitle="Get 24/7 support and motivation from your coach."
            themeColors={{ text: theme.colors.text, muted: theme.colors.textMuted, surface: theme.colors.surface, border: theme.colors.border }}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}> 
        <TouchableOpacity style={styles.cta} onPress={handleStart} testID="intro-start">
          <Text style={styles.ctaText}>Start For Free</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FeatureCard({ icon: Icon, title, subtitle, themeColors }: { icon: React.ComponentType<{ size?: number; color?: string }>; title: string; subtitle: string; themeColors: { text: string; muted: string; surface: string; border: string } }) {
  return (
    <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}> 
      <View style={styles.cardIconWrap}>
        <Icon size={22} color="#007AFF" />
      </View>
      <View style={styles.cardTextWrap}>
        <Text style={[styles.cardTitle, { color: themeColors.text }]}>{title}</Text>
        <Text style={[styles.cardSubtitle, { color: themeColors.muted }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 100 },
  heroWrap: { paddingHorizontal: 16, paddingTop: 12 },
  hero: { width: '100%', minHeight: 320, borderRadius: 12, overflow: 'hidden' },
  heroImg: { borderRadius: 12 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', paddingHorizontal: 16 },
  subtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 16, marginTop: 8 },
  cards: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, borderWidth: 1 },
  cardIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,122,255,0.1)' },
  cardTextWrap: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSubtitle: { fontSize: 13, marginTop: 2 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, borderTopWidth: 1, backgroundColor: 'transparent' },
  cta: { backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
