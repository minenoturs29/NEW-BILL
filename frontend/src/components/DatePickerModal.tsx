import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/src/lib/theme';

type Props = {
  visible: boolean;
  initialDate: Date;
  title?: string;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function DatePickerModal({
  visible,
  initialDate,
  title = 'Select Date',
  onClose,
  onConfirm,
}: Props) {
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [selected, setSelected] = useState<Date>(initialDate);

  // Keep state in sync when reopened with a new initialDate
  React.useEffect(() => {
    if (visible) {
      setViewYear(initialDate.getFullYear());
      setViewMonth(initialDate.getMonth());
      setSelected(initialDate);
    }
  }, [visible, initialDate]);

  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth]
  );
  const today = new Date();

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              testID="date-picker-close"
              hitSlop={10}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={colors.onSurface} />
            </Pressable>
          </View>

          <View style={styles.monthRow}>
            <Pressable
              testID="date-picker-prev"
              onPress={goPrev}
              hitSlop={10}
              style={styles.navBtn}
            >
              <Ionicons name="chevron-back" size={22} color={colors.brand} />
            </Pressable>
            <Text style={styles.monthLabel}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <Pressable
              testID="date-picker-next"
              onPress={goNext}
              hitSlop={10}
              style={styles.navBtn}
            >
              <Ionicons name="chevron-forward" size={22} color={colors.brand} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {DAY_LABELS.map((d, i) => (
              <Text key={i} style={styles.weekLabel}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((d, idx) => {
              if (!d) {
                return <View key={idx} style={styles.cell} />;
              }
              const isSelected = sameDay(d, selected);
              const isToday = sameDay(d, today);
              return (
                <Pressable
                  key={idx}
                  testID={`date-cell-${d.getDate()}`}
                  style={styles.cell}
                  onPress={() => setSelected(d)}
                >
                  <View
                    style={[
                      styles.dayDot,
                      isSelected && styles.dayDotSelected,
                      !isSelected && isToday && styles.dayDotToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                        !isSelected && isToday && styles.dayTextToday,
                      ]}
                    >
                      {d.getDate()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable
              testID="date-picker-cancel"
              style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.85 }]}
              onPress={onClose}
            >
              <Text style={styles.cancelTxt}>Cancel</Text>
            </Pressable>
            <Pressable
              testID="date-picker-confirm"
              style={({ pressed }) => [styles.confirmBtn, pressed && { opacity: 0.85 }]}
              onPress={() => onConfirm(selected)}
            >
              <Text style={styles.confirmTxt}>Confirm</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceTertiary,
    paddingVertical: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotSelected: {
    backgroundColor: colors.brand,
  },
  dayDotToday: {
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  dayText: {
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: colors.onBrandPrimary,
    fontWeight: '800',
  },
  dayTextToday: {
    color: colors.brand,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
  },
  cancelTxt: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: 'center',
  },
  confirmTxt: {
    color: colors.onBrandPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
