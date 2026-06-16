import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, SHOP } from '@/src/lib/theme';
import { BillItem, calcAmount, calcTotal, newId, saveBill, Bill } from '@/src/lib/storage';
import { buildBillHtml } from '@/src/lib/billHtml';

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const y = d.getFullYear();
  return `${day}/${m}/${y}`;
}

export default function BillPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    customerName: string;
    fromDate: string;
    toDate: string;
    items: string;
    billDate?: string;
  }>();

  const items: BillItem[] = useMemo(() => {
    try {
      return JSON.parse(params.items || '[]');
    } catch {
      return [];
    }
  }, [params.items]);

  const total = useMemo(() => calcTotal(items), [items]);
  const billDateIso = params.billDate ?? new Date().toISOString();

  const bill: Bill = useMemo(
    () => ({
      id: params.id ?? newId(),
      customerName: String(params.customerName ?? ''),
      fromDate: String(params.fromDate),
      toDate: String(params.toDate),
      billDate: billDateIso,
      items,
      total,
      savedAt: new Date().toISOString(),
    }),
    [params, items, total, billDateIso]
  );

  const [savedFlag, setSavedFlag] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<'share' | 'print' | 'save' | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const generatePdf = async (): Promise<string> => {
    const html = buildBillHtml(bill);
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    return uri;
  };

  const onShare = async () => {
    if (busy) return;
    setBusy('share');
    try {
      const uri = await generatePdf();
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, {
          UTI: 'com.adobe.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Share Bill',
        });
      } else {
        showToast('Sharing not available on this device');
      }
    } catch (e) {
      showToast('Failed to share');
    } finally {
      setBusy(null);
    }
  };

  const onPrint = async () => {
    if (busy) return;
    setBusy('print');
    try {
      const html = buildBillHtml(bill);
      await Print.printAsync({ html });
    } catch (e) {
      showToast('Failed to print');
    } finally {
      setBusy(null);
    }
  };

  const onSave = async () => {
    if (busy) return;
    setBusy('save');
    try {
      await saveBill(bill);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSavedFlag(true);
      showToast('Bill saved');
    } catch (e) {
      showToast('Failed to save');
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          testID="preview-back-button"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Bill Preview</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Bill paper card — replicates the PDF exactly */}
        <View style={styles.paper} testID="bill-preview-paper">
          <Text style={styles.billDate}>Bill Date: {fmtDate(bill.billDate)}</Text>

          <View style={styles.centerBlock}>
            <Text style={styles.agency}>{SHOP.name}</Text>
            <Text style={styles.addr}>{SHOP.address}</Text>
            <Text style={styles.brands}>{SHOP.brands}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaName} testID="preview-customer-name">
              Name: {bill.customerName}
            </Text>
            <Text style={styles.metaRange}>
              FROM: {fmtDate(bill.fromDate)}  |  TO: {fmtDate(bill.toDate)}
            </Text>
          </View>

          {/* Table */}
          <View style={styles.table}>
            <View style={[styles.tr, styles.thRow]}>
              <Text style={[styles.th, styles.colSn]}>S.No.</Text>
              <Text style={[styles.th, styles.colP]}>Particulars</Text>
              <Text style={[styles.th, styles.colQ]}>Qty.</Text>
              <Text style={[styles.th, styles.colR]}>Rate</Text>
              <Text style={[styles.th, styles.colA]}>Amount</Text>
            </View>
            {items.map((it, idx) => (
              <View key={it.id} style={styles.tr}>
                <Text style={[styles.td, styles.colSn, styles.center]}>{idx + 1}</Text>
                <Text style={[styles.td, styles.colP]}>{it.name}</Text>
                <Text style={[styles.td, styles.colQ, styles.center]}>{it.qty}</Text>
                <Text style={[styles.td, styles.colR, styles.center]}>{it.rate}</Text>
                <Text style={[styles.td, styles.colA, styles.right]}>
                  {calcAmount(it.qty, it.rate).toFixed(1)}
                </Text>
              </View>
            ))}
            <View style={[styles.tr, styles.totalRow]}>
              <Text style={[styles.tdTotal, { flex: 4, textAlign: 'left' }]}>TOTAL</Text>
              <Text style={[styles.tdTotal, styles.colA, styles.right]} testID="preview-total">
                Rs. {bill.total.toFixed(1)}/-
              </Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.thankYou}>*Thank you, Visit Again</Text>
              <Text style={styles.contactTxt}>Contact: {SHOP.phone}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.forShop}>For SRS Agencies</Text>
              <View style={styles.signLine} />
              <Text style={styles.signTxt}>Signature</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {toast ? (
        <View style={styles.toast} testID="preview-toast">
          <Text style={styles.toastTxt}>{toast}</Text>
        </View>
      ) : null}

      <View style={styles.bottomBar}>
        <ActionBtn
          testID="share-button"
          icon="share-social"
          label="Share"
          onPress={onShare}
          loading={busy === 'share'}
        />
        <ActionBtn
          testID="print-button"
          icon="print"
          label="Print"
          onPress={onPrint}
          loading={busy === 'print'}
        />
        <ActionBtn
          testID="save-button"
          icon={savedFlag ? 'checkmark-circle' : 'save'}
          label={savedFlag ? 'Saved' : 'Save'}
          primary
          onPress={onSave}
          loading={busy === 'save'}
        />
      </View>
    </SafeAreaView>
  );
}

function ActionBtn({
  icon,
  label,
  onPress,
  primary,
  testID,
  loading,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  primary?: boolean;
  testID: string;
  loading?: boolean;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        primary && styles.actionBtnPrimary,
        pressed && { opacity: 0.85 },
        loading && { opacity: 0.6 },
      ]}
      disabled={loading}
    >
      <Ionicons
        name={icon}
        size={20}
        color={primary ? colors.onBrandPrimary : colors.brand}
      />
      <Text
        style={[
          styles.actionBtnTxt,
          primary && { color: colors.onBrandPrimary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const BORDER = '#0E2A6B';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
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
  scroll: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  paper: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  billDate: {
    fontSize: 12,
    color: '#000',
    marginBottom: spacing.sm,
  },
  centerBlock: { alignItems: 'center', marginBottom: spacing.md },
  agency: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#000',
  },
  addr: { fontSize: 11, color: '#000', marginTop: 2 },
  brands: { fontSize: 11, color: '#000', marginTop: 2, fontWeight: '600' },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
    gap: 4,
  },
  metaName: { fontSize: 12, fontWeight: '700', color: '#000' },
  metaRange: { fontSize: 11, fontWeight: '700', color: '#000' },
  table: {
    borderWidth: 1.2,
    borderColor: BORDER,
    marginTop: spacing.sm,
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1.2,
    borderBottomColor: BORDER,
  },
  thRow: {},
  th: {
    fontSize: 11,
    fontWeight: '800',
    color: BORDER,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRightWidth: 1.2,
    borderRightColor: BORDER,
    textAlign: 'center',
  },
  td: {
    fontSize: 11,
    color: '#000',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRightWidth: 1.2,
    borderRightColor: BORDER,
  },
  colSn: { width: '12%' },
  colP: { flex: 1 },
  colQ: { width: '14%' },
  colR: { width: '16%' },
  colA: { width: '22%', borderRightWidth: 0 },
  center: { textAlign: 'center' },
  right: { textAlign: 'right', paddingRight: 6 },
  totalRow: { borderBottomWidth: 0 },
  tdTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  thankYou: { fontStyle: 'italic', fontSize: 11, color: '#000' },
  contactTxt: { fontSize: 11, color: '#000', marginTop: 2 },
  forShop: { fontSize: 11, color: '#000' },
  signLine: {
    marginTop: 28,
    width: 130,
    height: 1,
    backgroundColor: '#000',
  },
  signTxt: { fontSize: 11, color: '#000', marginTop: 2 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brandTertiary,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  actionBtnPrimary: {
    backgroundColor: colors.brand,
  },
  actionBtnTxt: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '700',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: colors.onSurface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  toastTxt: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
