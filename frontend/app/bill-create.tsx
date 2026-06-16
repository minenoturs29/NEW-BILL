import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '@/src/lib/theme';
import { BillItem, calcAmount, calcTotal, newId } from '@/src/lib/storage';

function fmtDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const y = d.getFullYear();
  return `${day}/${m}/${y}`;
}

export default function BillCreateScreen() {
  const router = useRouter();
  const { customerName } = useLocalSearchParams<{ customerName: string }>();

  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const [items, setItems] = useState<BillItem[]>([
    { id: newId(), name: '', qty: '', rate: '' },
  ]);

  const total = useMemo(() => calcTotal(items), [items]);

  const updateItem = (id: string, field: keyof BillItem, value: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const addItem = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setItems((prev) => [...prev, { id: newId(), name: '', qty: '', rate: '' }]);
  };

  const removeItem = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((i) => i.id !== id)));
  };

  const onGenerate = () => {
    const cleaned = items.filter(
      (it) => it.name.trim() && (parseFloat(it.qty) || 0) > 0 && (parseFloat(it.rate) || 0) >= 0
    );
    if (cleaned.length === 0) {
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.push({
      pathname: '/bill-preview',
      params: {
        customerName: String(customerName ?? ''),
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        items: JSON.stringify(cleaned),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          testID="back-button"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Create Bill</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {String(customerName ?? '')}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Billing Period</Text>
          <View style={styles.dateRow}>
            <Pressable
              testID="from-date-button"
              style={styles.dateBtn}
              onPress={() => setShowFrom(true)}
            >
              <Text style={styles.dateLabel}>FROM</Text>
              <Text style={styles.dateValue}>{fmtDate(fromDate)}</Text>
            </Pressable>
            <Pressable
              testID="to-date-button"
              style={styles.dateBtn}
              onPress={() => setShowTo(true)}
            >
              <Text style={styles.dateLabel}>TO</Text>
              <Text style={styles.dateValue}>{fmtDate(toDate)}</Text>
            </Pressable>
          </View>

          {showFrom && (
            <DateTimePicker
              testID="from-date-picker"
              value={fromDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(_, d) => {
                setShowFrom(Platform.OS === 'ios');
                if (d) setFromDate(d);
              }}
            />
          )}
          {showTo && (
            <DateTimePicker
              testID="to-date-picker"
              value={toDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(_, d) => {
                setShowTo(Platform.OS === 'ios');
                if (d) setToDate(d);
              }}
            />
          )}

          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Items</Text>

          {items.map((it, idx) => {
            const amt = calcAmount(it.qty, it.rate);
            return (
              <View key={it.id} style={styles.itemCard} testID={`item-card-${idx}`}>
                <View style={styles.itemHead}>
                  <Text style={styles.itemNo}>#{idx + 1}</Text>
                  {items.length > 1 ? (
                    <Pressable
                      testID={`remove-item-${idx}`}
                      hitSlop={10}
                      onPress={() => removeItem(it.id)}
                    >
                      <Ionicons name="close-circle" size={22} color={colors.error} />
                    </Pressable>
                  ) : null}
                </View>

                <TextInput
                  testID={`item-name-${idx}`}
                  style={styles.input}
                  placeholder="Item name (e.g. January)"
                  placeholderTextColor={colors.onSurfaceTertiary}
                  value={it.name}
                  onChangeText={(v) => updateItem(it.id, 'name', v)}
                />
                <View style={styles.row3}>
                  <View style={styles.col}>
                    <Text style={styles.smallLabel}>Quantity</Text>
                    <TextInput
                      testID={`item-qty-${idx}`}
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={colors.onSurfaceTertiary}
                      keyboardType="numeric"
                      value={it.qty}
                      onChangeText={(v) => updateItem(it.id, 'qty', v)}
                    />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.smallLabel}>Rate</Text>
                    <TextInput
                      testID={`item-rate-${idx}`}
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={colors.onSurfaceTertiary}
                      keyboardType="numeric"
                      value={it.rate}
                      onChangeText={(v) => updateItem(it.id, 'rate', v)}
                    />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.smallLabel}>Amount</Text>
                    <View style={[styles.input, styles.amountBox]}>
                      <Text
                        style={styles.amountText}
                        testID={`item-amount-${idx}`}
                      >
                        {amt.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}

          <Pressable
            testID="add-item-button"
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
            onPress={addItem}
          >
            <Ionicons name="add-circle" size={22} color={colors.brand} />
            <Text style={styles.addBtnText}>Add Item</Text>
          </Pressable>
        </ScrollView>

        <View style={styles.bottomBar}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue} testID="running-total">
              ₹ {total.toFixed(1)}
            </Text>
          </View>
          <Pressable
            testID="generate-bill-button"
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
            onPress={onGenerate}
          >
            <Text style={styles.primaryBtnText}>Generate Bill</Text>
            <Ionicons name="document-text" size={20} color={colors.onBrandPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl + 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurfaceSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateBtn: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceTertiary,
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: 4,
  },
  itemCard: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  itemHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemNo: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    color: colors.onSurface,
  },
  row3: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  col: { flex: 1 },
  smallLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceTertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  amountBox: {
    backgroundColor: colors.brandTertiary,
    borderColor: colors.brandTertiary,
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.brand,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brandTertiary,
    paddingVertical: 14,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  addBtnText: {
    color: colors.brand,
    fontSize: 15,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  totalBox: { flex: 1 },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceTertiary,
    letterSpacing: 0.6,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.brand,
    marginTop: 2,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brand,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  primaryBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
