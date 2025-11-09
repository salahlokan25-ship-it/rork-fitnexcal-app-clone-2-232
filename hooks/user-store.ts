import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/types/nutrition';
import { ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS, MACRO_RATIOS } from '@/constants/nutrition';
import { supabase } from '@/lib/supabase';

type AuthUser = { email: string } | null;

type StreakData = {
  currentStreak: number;
  lastLogDate: string;
  weeklyLogs: boolean[];
};

type WeightEntry = {
  date: string;
  weight: number;
  timestamp: number;
};

const AUTH_KEY = 'auth_user';
const ONBOARDING_KEY = 'onboarding_completed';
const USER_PROFILE_KEY = 'user_profile';
const STREAK_KEY = 'user_streak';
const WEIGHT_HISTORY_KEY = 'weight_history';

const onboardingKeyFor = (email: string) => `${ONBOARDING_KEY}:${email.toLowerCase()}`;

const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female' | 'other') => {
  if (gender === 'male') {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
};

const calculateCalorieGoal = (
  profile: Pick<
    UserProfile,
    'weight' | 'height' | 'age' | 'gender' | 'activity_level' | 'goal'
  >,
) => {
  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activity_level];
  const goalCalories = tdee + GOAL_ADJUSTMENTS[profile.goal];

  return {
    goal_calories: Math.round(goalCalories),
    goal_protein: Math.round((goalCalories * MACRO_RATIOS.protein) / 4),
    goal_carbs: Math.round((goalCalories * MACRO_RATIOS.carbs) / 4),
    goal_fat: Math.round((goalCalories * MACRO_RATIOS.fat) / 9),
  };
};

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastLogDate: '',
    weeklyLogs: [false, false, false, false, false, false, false],
  });
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);

  const loadState = useCallback(async () => {
    console.log('[UserStore] Loading state');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (session?.user?.email) {
        const email = session.user.email;
        setAuthUser({ email });

        const perUserOnboarding = await AsyncStorage.getItem(onboardingKeyFor(email));
        if (perUserOnboarding === null) {
          const legacy = await AsyncStorage.getItem(ONBOARDING_KEY);
          const legacyBool = legacy === 'true';
          await AsyncStorage.setItem(onboardingKeyFor(email), legacyBool ? 'true' : 'false');
          setHasCompletedOnboarding(legacyBool);
        } else {
          setHasCompletedOnboarding(perUserOnboarding === 'true');
        }

        // Load profile from Supabase
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileRow) {
          const loadedProfile: UserProfile = {
            id: session.user.id,
            name: profileRow.display_name ?? profileRow.name ?? '',
            age: profileRow.age ?? 0,
            gender: (profileRow.gender ?? 'male') as 'male' | 'female' | 'other',
            height: profileRow.height ?? 0,
            weight: profileRow.weight ?? 0,
            weightGoal: profileRow.weight_goal ?? undefined,
            activity_level: (profileRow.activity_level ?? 'moderate') as UserProfile['activity_level'],
            goal: (profileRow.goal ?? 'maintain_weight') as UserProfile['goal'],
            goal_calories: profileRow.goal_calories ?? 0,
            goal_protein: profileRow.goal_protein ?? 0,
            goal_carbs: profileRow.goal_carbs ?? 0,
            goal_fat: profileRow.goal_fat ?? 0,
            is_premium: !!profileRow.is_premium,
            avatar_url: profileRow.avatar_url ?? undefined,
            medical_conditions: profileRow.medical_conditions ?? undefined,
            allergies: profileRow.allergies ?? undefined,
            lab_values: profileRow.lab_values ?? undefined,
            nutrition_preferences: profileRow.nutrition_preferences ?? undefined,
          };
          setUser(loadedProfile);
        } else {
          setUser(null);
        }

        const storedStreak = await AsyncStorage.getItem(STREAK_KEY);
        if (storedStreak) {
          setStreakData(JSON.parse(storedStreak));
        }

        const storedWeightHistory = await AsyncStorage.getItem(WEIGHT_HISTORY_KEY);
        if (storedWeightHistory) {
          setWeightHistory(JSON.parse(storedWeightHistory));
        }
      } else {
        setAuthUser(null);
        setUser(null);
        const legacy = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(legacy === 'true');
      }
    } catch (error) {
      console.error('[UserStore] Error loading state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const email = session?.user?.email ?? null;
      setAuthUser(email ? { email } : null);
      if (email) {
        // Reload profile when auth changes
        await loadState();
      } else {
        setUser(null);
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [loadState]);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      throw new Error('Email and password are required');
    }
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signUp({ email: normalizedEmail, password: password.trim() });
      if (error) throw error;
      await AsyncStorage.setItem(onboardingKeyFor(normalizedEmail), 'false');
      setAuthUser({ email: normalizedEmail });
      setHasCompletedOnboarding(false);
      return { email: normalizedEmail } as AuthUser;
    } catch (e) {
      console.error('[UserStore] signUp error', e);
      throw e;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      throw new Error('Email and password are required');
    }
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: password.trim() });
      if (error) throw error;
      setAuthUser({ email: normalizedEmail });
      const perUserOnboarding = await AsyncStorage.getItem(onboardingKeyFor(normalizedEmail));
      if (perUserOnboarding === null) {
        await AsyncStorage.setItem(onboardingKeyFor(normalizedEmail), 'false');
        setHasCompletedOnboarding(false);
      } else {
        setHasCompletedOnboarding(perUserOnboarding === 'true');
      }
      return { email: normalizedEmail } as AuthUser;
    } catch (e) {
      console.error('[UserStore] signIn error', e);
      throw e;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setAuthUser(null);
    } catch (e) {
      console.error('[UserStore] signOut error', e);
    }
  }, []);

  const createUser = useCallback(
    async (
      profileData: Omit<
        UserProfile,
        'id' | 'goal_calories' | 'goal_protein' | 'goal_carbs' | 'goal_fat' | 'is_premium'
      > & { weightGoal?: number },
    ) => {
      if (!profileData.name?.trim() || !profileData.age || !profileData.weight || !profileData.height) {
        throw new Error('Invalid profile data');
      }

      try {
        const goals = calculateCalorieGoal(profileData);

        // Determine current user id from Supabase session
        const { data: sess } = await supabase.auth.getSession();
        const userId = sess.session?.user?.id ?? Date.now().toString();

        const newUser: UserProfile = {
          ...profileData,
          ...goals,
          id: userId,
          is_premium: false,
        };

        const initialWeightEntry: WeightEntry = {
          date: new Date().toISOString().split('T')[0],
          weight: profileData.weight,
          timestamp: Date.now(),
        };
        await AsyncStorage.setItem(WEIGHT_HISTORY_KEY, JSON.stringify([initialWeightEntry]));
        setWeightHistory([initialWeightEntry]);

        // Upsert profile to Supabase
        await supabase.from('profiles').upsert({
          id: userId,
          email: (authUser?.email ?? null),
          display_name: newUser.name,
          age: newUser.age,
          gender: newUser.gender,
          height: newUser.height,
          weight: newUser.weight,
          weight_goal: newUser.weightGoal ?? null,
          activity_level: newUser.activity_level,
          goal: newUser.goal,
          goal_calories: newUser.goal_calories,
          goal_protein: newUser.goal_protein,
          goal_carbs: newUser.goal_carbs,
          goal_fat: newUser.goal_fat,
          is_premium: newUser.is_premium,
          updated_at: new Date().toISOString(),
        });

        await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newUser));
        setUser(newUser);
        return newUser;
      } catch (error) {
        console.error('[UserStore] Error creating user:', error);
        throw error;
      }
    },
    [],
  );

  const updateUser = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) {
        throw new Error('User not loaded');
      }

      try {
        const updatedUser = { ...user, ...updates } as UserProfile;

        if (
          updates.weight !== undefined ||
          updates.height !== undefined ||
          updates.age !== undefined ||
          updates.activity_level !== undefined ||
          updates.goal !== undefined
        ) {
          const goals = calculateCalorieGoal(updatedUser);
          Object.assign(updatedUser, goals);
        }

        if (updates.weight !== undefined && updates.weight !== user.weight) {
          const newEntry: WeightEntry = {
            date: new Date().toISOString().split('T')[0],
            weight: updates.weight,
            timestamp: Date.now(),
          };
          const updatedHistory = [...weightHistory, newEntry];
          await AsyncStorage.setItem(WEIGHT_HISTORY_KEY, JSON.stringify(updatedHistory));
          setWeightHistory(updatedHistory);
        }

        // Persist to Supabase
        await supabase.from('profiles').upsert({
          id: updatedUser.id,
          display_name: updatedUser.name,
          age: updatedUser.age,
          gender: updatedUser.gender,
          height: updatedUser.height,
          weight: updatedUser.weight,
          weight_goal: updatedUser.weightGoal ?? null,
          activity_level: updatedUser.activity_level,
          goal: updatedUser.goal,
          goal_calories: updatedUser.goal_calories,
          goal_protein: updatedUser.goal_protein,
          goal_carbs: updatedUser.goal_carbs,
          goal_fat: updatedUser.goal_fat,
          is_premium: updatedUser.is_premium,
          updated_at: new Date().toISOString(),
        });

        await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
      } catch (error) {
        console.error('[UserStore] Error updating user:', error);
        throw error;
      }
    },
    [user, weightHistory],
  );

  const completeOnboarding = useCallback(async () => {
    try {
      const email = authUser?.email;
      if (email) {
        await AsyncStorage.setItem(onboardingKeyFor(email), 'true');
      } else {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      }
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('[UserStore] Error completing onboarding:', error);
    }
  }, [authUser]);

  const upgradeToPremium = useCallback(async () => {
    if (user) {
      await updateUser({ is_premium: true });
    }
  }, [user, updateUser]);

  const isAuthenticated = useMemo(() => authUser !== null, [authUser]);

  const updateStreak = useCallback(async () => {
    try {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let newStreak = streakData.currentStreak;
      let newWeeklyLogs = [...streakData.weeklyLogs];

      if (streakData.lastLogDate !== today) {
        if (streakData.lastLogDate === yesterday) {
          newStreak += 1;
        } else if (streakData.lastLogDate === '') {
          newStreak = 1;
        } else {
          newStreak = 1;
        }

        const dayOfWeek = new Date().getDay();
        newWeeklyLogs = [false, false, false, false, false, false, false];
        newWeeklyLogs[dayOfWeek] = true;

        const newStreakData: StreakData = {
          currentStreak: newStreak,
          lastLogDate: today,
          weeklyLogs: newWeeklyLogs,
        };

        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newStreakData));
        setStreakData(newStreakData);
      }
    } catch (error) {
      console.error('[UserStore] Error updating streak:', error);
    }
  }, [streakData]);

  const getWeightHistory = useCallback((days?: number) => {
    if (!days) return weightHistory;
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return weightHistory.filter(entry => entry.timestamp >= cutoff);
  }, [weightHistory]);

  return useMemo(
    () => ({
      user,
      isLoading,
      hasCompletedOnboarding,
      isAuthenticated,
      authUser,
      streakData,
      weightHistory,
      signIn,
      signUp,
      signOut,
      createUser,
      updateUser,
      completeOnboarding,
      upgradeToPremium,
      updateStreak,
      getWeightHistory,
    }),
    [
      user,
      isLoading,
      hasCompletedOnboarding,
      isAuthenticated,
      authUser,
      streakData,
      weightHistory,
      signIn,
      signUp,
      signOut,
      createUser,
      updateUser,
      completeOnboarding,
      upgradeToPremium,
      updateStreak,
      getWeightHistory,
    ],
  );
});