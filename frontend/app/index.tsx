import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, SHOP } from '@/src/lib/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const onNext = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter customer name');
      return;
    }
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push({ pathname: '/bill-create', params: { customerName: trimmed } });
  };

  const onSaved = () => {
    router.push('/saved-bills');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoWrap} testID="home-logo">
              <Image
                source={{ uri: SHOP.logoUrl }}
                style={styles.logo}
                contentFit="contain"
                transition={200}
              />
            </View>

            <Text style={styles.title}>New Bill</Text>
            <Text style={styles.subtitle}>Enter the customer&apos;s name to start.</Text>

            <Text style={styles.label}>Customer Name</Text>
            <TextInput
              testID="customer-name-input"
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="e.g. Dr Girish Natyana"
              placeholderTextColor={colors.onSurfaceTertiary}
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (error) setError('');
              }}
              returnKeyType="next"
              onSubmitEditing={onNext}
              autoCapitalize="words"
            />
            {error ? <Text style={styles.errorText} testID="customer-name-error">{error}</Text> : null}
          </ScrollView>
        </TouchableWithoutFeedback>

        <View style={styles.bottomBar}>
          <Pressable
            testID="saved-bills-button"
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={onSaved}
          >
            <Ionicons name="folder-open-outline" size={20} color={colors.brand} />
            <Text style={styles.secondaryBtnText}>Saved Bills</Text>
          </Pressable>

          <Pressable
            testID="next-button"
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={onNext}
          >
            <Text style={styles.primaryBtnText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.onBrandPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: radius.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 16,
    color: colors.onSurface,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    marginTop: spacing.sm,
    fontSize: 13,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  primaryBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: radius.md,
  },
  primaryBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brandTertiary,
    paddingVertical: 16,
    borderRadius: radius.md,
  },
  secondaryBtnText: {
    color: colors.brand,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: { opacity: 0.85 },
});
