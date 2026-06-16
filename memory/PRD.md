# SRS Agency — Milk Billing Mobile App

## Overview
A simple, fast billing app for SRS Agencies (milk business) that lets the shopkeeper create, preview, share, print and save bills that exactly match their existing PDF bill format.

## Goals
- Quickly create a bill for any customer
- Generate a printable/shareable PDF that mirrors the SRS Agency layout
- Keep saved bills on-device for later reference

## Tech
- React Native + Expo Router (Expo SDK 54)
- AsyncStorage for local persistence (no backend)
- `expo-print` for PDF generation
- `expo-sharing` for share sheet
- `@react-native-community/datetimepicker` for date selection
- Brand: deep navy `#133A82` (from logo), white surfaces

## Screens
1. **Home (`/`)** — Logo, Customer Name input, `Next` (→ Bill Create) and `Saved Bills` actions.
2. **Bill Create (`/bill-create`)** — From / To date pickers, dynamic list of item cards (name, qty, rate, auto-calc amount), `+ Add Item`, sticky `Generate Bill` bar with running total.
3. **Bill Preview (`/bill-preview`)** — Replica of the SRS Agency PDF (shop name, address `Plot No. 7-1-64/2/B, D.K. Road, Ameerpet, Hyd - 16.`, brands `VIJAYA, JERSEY, HERITAGE, NANDINI`, contact `9949384526`, signed footer). Sticky `Share`, `Print`, `Save` actions.
4. **Saved Bills (`/saved-bills`)** — List of saved bills with customer name, date range, total. Tap to reopen, trash icon to delete.

## Data Model
- `Bill { id, customerName, fromDate, toDate, billDate, items[], total, savedAt }`
- `BillItem { id, name, qty, rate }`
- Storage key: `srs.bills.v1` (AsyncStorage)

## Out of scope (current MVP)
- Authentication, multi-user, cloud sync
- Bill numbering / GST / discounts
- Item presets / customer directory
