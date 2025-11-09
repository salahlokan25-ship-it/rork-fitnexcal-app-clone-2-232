import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useUser } from '@/hooks/user-store';
import { useTheme } from '@/hooks/theme';
import { User, Mail, Calendar, Ruler, Weight, Activity as ActivityIcon, Target } from 'lucide-react-native';

export default function EditProfileScreen() {
  const { user, updateUser, createUser } = useUser();
  const { theme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  const dynamic = stylesWithTheme(theme);

  const handleSave = async () => {
    const updates: any = {};
    const trimmedName = name.trim();
    if (trimmedName) updates.name = trimmedName;

    if (age.trim()) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
        Alert.alert('Error', 'Please enter a valid age (10-120)');
        return;
      }
      updates.age = ageNum;
    }

    if (weight.trim()) {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
        Alert.alert('Error', 'Please enter a valid weight (20-300 kg)');
        return;
      }
      updates.weight = weightNum;
    }

    if (height.trim()) {
      const heightNum = parseFloat(height);
      if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
        Alert.alert('Error', 'Please enter a valid height (100-250 cm)');
        return;
      }
      updates.height = heightNum;
    }

    if (!updates.name && updates.age === undefined && updates.weight === undefined && updates.height === undefined) {
      Alert.alert('Error', 'Please enter at least one field to update');
      return;
    }

    try {
      setIsSaving(true);
      await updateUser(updates);
      router.back();
    } catch (error: any) {
      const msg = typeof error?.message === 'string' ? error.message : '';
      if (/User not loaded/i.test(msg)) {
        const fullName = name.trim();
        const ageOk = age.trim() && !isNaN(parseInt(age)) && parseInt(age) >= 10 && parseInt(age) <= 120;
        const weightOk = weight.trim() && !isNaN(parseFloat(weight)) && parseFloat(weight) >= 20 && parseFloat(weight) <= 300;
        const heightOk = height.trim() && !isNaN(parseFloat(height)) && parseFloat(height) >= 100 && parseFloat(height) <= 250;
        if (fullName && ageOk && weightOk && heightOk) {
          try {
            await createUser({
              name: fullName,
              age: parseInt(age),
              weight: parseFloat(weight),
              height: parseFloat(height),
              gender: 'other',
              activity_level: 'moderate',
              goal: 'maintain_weight',
              weightGoal: undefined,
            } as any);
            router.back();
            return;
          } catch (e) {
            Alert.alert('Error', 'Could not create your profile. Please try again.');
          }
        } else {
          Alert.alert('Almost there', 'Please fill Name, Age, Weight and Height to create your profile the first time.');
        }
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={dynamic.container}>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={dynamic.content} showsVerticalScrollIndicator={false}>
        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>Personal Information</Text>

          <View style={dynamic.inputGroup}>
            <View style={dynamic.inputLabel}>
              <User size={20} color={theme.colors.primary700} />
              <Text style={dynamic.labelText}>Full Name</Text>
            </View>
            <TextInput
              style={dynamic.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <View style={dynamic.inputGroup}>
            <View style={dynamic.inputLabel}>
              <Calendar size={20} color={theme.colors.primary700} />
              <Text style={dynamic.labelText}>Age</Text>
            </View>
            <TextInput
              style={dynamic.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter your age"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>Body Measurements</Text>

          <View style={dynamic.inputGroup}>
            <View style={dynamic.inputLabel}>
              <Weight size={20} color={theme.colors.primary700} />
              <Text style={dynamic.labelText}>Weight (kg)</Text>
            </View>
            <TextInput
              style={dynamic.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter your weight"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={dynamic.inputGroup}>
            <View style={dynamic.inputLabel}>
              <Ruler size={20} color={theme.colors.primary700} />
              <Text style={dynamic.labelText}>Height (cm)</Text>
            </View>
            <TextInput
              style={dynamic.input}
              value={height}
              onChangeText={setHeight}
              placeholder="Enter your height"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>Current Goals</Text>
          <View style={dynamic.infoCard}>
            <View style={dynamic.infoRow}>
              <View style={dynamic.infoLabel}>
                <Target size={18} color={theme.colors.textMuted} />
                <Text style={dynamic.infoText}>Goal</Text>
              </View>
              <Text style={dynamic.infoValue}>{user?.goal || 'Not set'}</Text>
            </View>
            <View style={dynamic.infoRow}>
              <View style={dynamic.infoLabel}>
                <ActivityIcon size={18} color={theme.colors.textMuted} />
                <Text style={dynamic.infoText}>Activity Level</Text>
              </View>
              <Text style={dynamic.infoValue}>{user?.activity_level || 'Not set'}</Text>
            </View>
          </View>
          <Text style={dynamic.infoNote}>
            To change your goals or activity level, please complete the onboarding quiz again.
          </Text>
        </View>

        <TouchableOpacity
          style={[dynamic.saveButton, isSaving && dynamic.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={dynamic.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const stylesWithTheme = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  infoNote: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 12,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: theme.colors.primary700,
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
