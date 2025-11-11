import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/theme';
import { supabase } from '@/lib/supabase';

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { theme, mode } = useTheme();
  const [annual, setAnnual] = useState<boolean>(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const styles = useMemo(() => themedStyles(theme, mode), [theme, mode]);

  const PRICES = {
    pro_monthly: 'price_1SHAnn5zRnOqdXkPXmwWY4X8',
    pro_yearly: 'price_1SHAoD5zRnOqdXkPTCR8a225',
    premium_monthly: 'price_1SRYKA5zRnOqdXkPjjwTRvzA',
    premium_yearly: 'price_1SRYKc5zRnOqdXkPrd5zHNaF',
  } as const;

  const startCheckout = async (plan: 'Pro' | 'Premium') => {
    try {
      const key = `${plan.toLowerCase()}_${annual ? 'yearly' : 'monthly'}` as keyof typeof PRICES;
      const priceId = PRICES[key];
      setLoadingPlan(`${plan}-${annual ? 'yearly' : 'monthly'}`);
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          planName: `${plan} ${annual ? 'Yearly' : 'Monthly'}`,
          success_url: 'myapp://billing/success',
          cancel_url: 'myapp://billing/cancel',
        },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (!url) throw new Error('No checkout URL received');
      await WebBrowser.openBrowserAsync(url);
    } catch (e: any) {
      Alert.alert('Checkout error', typeof e?.message === 'string' ? e.message : 'Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Text style={styles.headerIcon}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Unlock Your Full Potential</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View style={styles.toggleBar}>
          <TouchableOpacity
            style={[styles.toggleItem, !annual && styles.toggleOn]}
            onPress={() => setAnnual(false)}
          >
            <Text style={[styles.toggleText, !annual && styles.toggleTextOn]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleItem, annual && styles.toggleOn]}
            onPress={() => setAnnual(true)}
          >
            <Text style={[styles.toggleText, annual && styles.toggleTextOn]}>Annual</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 12 }}>
          <PlanCard
            title="Pro"
            badge="Best Value"
            price={annual ? '$59.99' : '$9.99'}
            period={annual ? '/year' : '/month'}
            subtitle={annual ? 'Billed annually, or $9.99/month.' : 'Billed monthly.'}
            primary={false}
            ctaLabel="Upgrade to Pro"
            features={[
              'Unlimited AI Scans',
              'Advanced Nutrient Tracking',
              'Custom Meal Plans',
            ]}
            onPress={() => startCheckout('Pro')}
            loading={loadingPlan === `Pro-${annual ? 'yearly' : 'monthly'}`}
          />

          <PlanCard
            title="Premium"
            badge="Save 40%"
            price={annual ? '$99.99' : '$14.99'}
            period={annual ? '/year' : '/month'}
            subtitle={annual ? 'Billed annually, or $14.99/month.' : 'Billed monthly.'}
            primary
            ctaLabel="Upgrade to Premium"
            features={[
              'All Pro features',
              'Personalized Coaching',
              'Recipe Integration',
              'Priority Support',
            ]}
            onPress={() => startCheckout('Premium')}
            loading={loadingPlan === `Premium-${annual ? 'yearly' : 'monthly'}`}
          />
        </View>

        <View style={{ alignItems: 'center', paddingTop: 16, gap: 16 }}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Text style={styles.continueBtnText}>Continue with Free Plan</Text>
          </TouchableOpacity>
          
          <Text style={styles.freeNote}>Staying on the Free plan? You'll have limited daily scans and basic tracking.</Text>
          <View style={styles.linksRow}>
            <TouchableOpacity onPress={() => router.push('/terms-of-service')}>
              <Text style={styles.link}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
              <Text style={styles.link}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PlanCard({ title, badge, price, period, subtitle, primary, ctaLabel, features, onPress, loading }: { title: string; badge: string; price: string; period: string; subtitle: string; primary?: boolean; ctaLabel: string; features: string[]; onPress: () => void; loading?: boolean }) {
  const { theme, mode } = useTheme();
  return (
    <View style={[{
      borderRadius: 16,
      padding: 16,
      borderWidth: primary ? 2 : 1,
      borderColor: primary ? theme.colors.primary700 : (mode === 'dark' ? '#324467' : theme.colors.border),
      backgroundColor: mode === 'dark' ? '#192233' : theme.colors.surface,
      shadowColor: theme.colors.primary700,
      shadowOpacity: primary ? 0.2 : 0,
      shadowRadius: primary ? 12 : 0,
    }]}
    >
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: mode === 'dark' ? '#ffffff' : theme.colors.text, fontWeight: '700', fontSize: 16 }}>{title}</Text>
          <Text style={{ backgroundColor: theme.colors.primary700, color: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, fontSize: 12 }}>{badge}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ color: mode === 'dark' ? '#ffffff' : theme.colors.text, fontSize: 32, fontWeight: '800' }}>{price}</Text>
          <Text style={{ color: mode === 'dark' ? '#92a4c9' : theme.colors.textMuted, fontWeight: '700' }}>{period}</Text>
        </View>
        <Text style={{ color: mode === 'dark' ? '#92a4c9' : theme.colors.textMuted, fontSize: 13 }}>{subtitle}</Text>
      </View>

      <TouchableOpacity
        style={{ marginTop: 12, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: primary ? theme.colors.primary700 : (mode === 'dark' ? '#232f48' : 'rgba(0,0,0,0.06)') }}
        onPress={onPress}
        disabled={!!loading}
      >
        {loading ? (
          <ActivityIndicator color={primary ? '#fff' : (mode === 'dark' ? '#ffffff' : theme.colors.text)} />
        ) : (
          <Text style={{ color: primary ? '#fff' : (mode === 'dark' ? '#ffffff' : theme.colors.text), fontWeight: '700' }}>{ctaLabel}</Text>
        )}
      </TouchableOpacity>

      <View style={{ gap: 8, marginTop: 12 }}>
        {features.map((f, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: theme.colors.primary700 }}>{'✔︎'}</Text>
            <Text style={{ color: mode === 'dark' ? '#ffffff' : theme.colors.text, fontSize: 13 }}>{f}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const themedStyles = (theme: any, mode: string) => StyleSheet.create({
  root: { flex: 1, backgroundColor: mode === 'dark' ? '#101622' : '#f6f6f8' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: mode === 'dark' ? '#324467' : theme.colors.border },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { color: mode === 'dark' ? '#ffffff' : theme.colors.text, fontSize: 18, fontWeight: '800' },
  headerTitle: { color: mode === 'dark' ? '#ffffff' : theme.colors.text, fontWeight: '700', fontSize: 16 },
  toggleBar: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: mode === 'dark' ? '#232f48' : 'rgba(0,0,0,0.06)',
    padding: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  toggleItem: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: mode === 'dark' ? '#101622' : theme.colors.background,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  toggleText: { color: mode === 'dark' ? '#92a4c9' : theme.colors.textMuted, fontWeight: '700' },
  toggleTextOn: { color: mode === 'dark' ? '#ffffff' : theme.colors.text },
  continueBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mode === 'dark' ? '#232f48' : 'rgba(0, 0, 0, 0.08)',
    borderWidth: 1,
    borderColor: mode === 'dark' ? '#324467' : theme.colors.border,
  },
  continueBtnText: {
    color: mode === 'dark' ? '#ffffff' : theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  freeNote: { color: mode === 'dark' ? '#92a4c9' : theme.colors.textMuted, fontSize: 13, textAlign: 'center' },
  linksRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  link: { color: mode === 'dark' ? '#92a4c9' : theme.colors.textMuted, textDecorationLine: 'underline', fontSize: 13 },
});
