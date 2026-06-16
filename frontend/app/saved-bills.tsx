import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '@/src/lib/theme';
import { Bill, deleteBill, getBills } from '@/src/lib/storage';

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const y = d.getFullYear();
  return `${day}/${m}/${y}`;
}

export default function SavedBillsScreen() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await getBills();
    setBills(list);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onOpen = (b: Bill) => {
    router.push({
      pathname: '/bill-preview',
      params: {
        id: b.id,
        customerName: b.customerName,
        fromDate: b.fromDate,
        toDate: b.toDate,
        billDate: b.billDate,
        items: JSON.stringify(b.items),
      },
    });
  };

  const onDelete = async (b: Bill) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    await deleteBill(b.id);
    await load();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          testID="saved-back-button"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Saved Bills</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.muted}>Loading…</Text>
        </View>
      ) : bills.length === 0 ? (
        <View style={styles.center} testID="empty-state">
          <Ionicons name="receipt-outline" size={64} color={colors.onSurfaceTertiary} />
          <Text style={styles.emptyTitle}>No saved bills yet</Text>
          <Text style={styles.emptySub}>Bills you save will appear here.</Text>
          <Pressable
            testID="empty-create-button"
            onPress={() => router.replace('/')}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="add" size={20} color={colors.onBrandPrimary} />
            <Text style={styles.primaryBtnText}>Create New Bill</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <Pressable
              testID={`saved-bill-${index}`}
              onPress={() => onOpen(item)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.customerName}
                </Text>
                <Text style={styles.cardRange}>
                  {fmtDate(item.fromDate)} → {fmtDate(item.toDate)}
                </Text>
                <Text style={styles.cardDate}>Saved: {fmtDate(item.savedAt)}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardTotal}>₹{item.total.toFixed(0)}</Text>
                <Pressable
                  testID={`delete-bill-${index}`}
                  hitSlop={10}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onDelete(item);
                  }}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </Pressable>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs, width: 32 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  muted: { color: colors.onSurfaceSecondary },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
    marginTop: spacing.md,
  },
  emptySub: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.md,
    marginTop: spacing.xl,
  },
  primaryBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  cardRange: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  cardDate: {
    fontSize: 11,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  cardTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
});
