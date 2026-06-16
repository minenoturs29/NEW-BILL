import AsyncStorage from '@react-native-async-storage/async-storage';

export type BillItem = {
  id: string;
  name: string;
  qty: string;
  rate: string;
};

export type Bill = {
  id: string;
  customerName: string;
  fromDate: string; // ISO
  toDate: string; // ISO
  billDate: string; // ISO (when saved)
  items: BillItem[];
  total: number;
  savedAt: string; // ISO
};

const KEY = 'srs.bills.v1';

export async function getBills(): Promise<Bill[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Bill[];
    return list.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
  } catch {
    return [];
  }
}

export async function saveBill(bill: Bill): Promise<void> {
  const list = await getBills();
  const idx = list.findIndex((b) => b.id === bill.id);
  if (idx >= 0) list[idx] = bill;
  else list.unshift(bill);
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function deleteBill(id: string): Promise<void> {
  const list = await getBills();
  const next = list.filter((b) => b.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function getBill(id: string): Promise<Bill | null> {
  const list = await getBills();
  return list.find((b) => b.id === id) ?? null;
}

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function calcAmount(qty: string, rate: string): number {
  const q = parseFloat(qty || '0') || 0;
  const r = parseFloat(rate || '0') || 0;
  return q * r;
}

export function calcTotal(items: BillItem[]): number {
  return items.reduce((sum, i) => sum + calcAmount(i.qty, i.rate), 0);
}
