import type { Bill } from './storage';
import { SHOP } from './theme';
import { calcAmount } from './storage';

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function buildBillHtml(bill: Bill): string {
  const rows = bill.items
    .map((it, idx) => {
      const amt = calcAmount(it.qty, it.rate);
      return `<tr>
        <td class="c">${idx + 1}</td>
        <td class="l">${escapeHtml(it.name)}</td>
        <td class="c">${escapeHtml(it.qty)}</td>
        <td class="c">${escapeHtml(it.rate)}</td>
        <td class="r">${amt.toFixed(1)}</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 18mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: Helvetica, Arial, sans-serif; color: #000; margin: 0; padding: 0; }
  .billdate { font-size: 11pt; margin-bottom: 8px; }
  .header { text-align: center; margin-bottom: 6px; }
  .agency { font-size: 26pt; font-weight: 800; letter-spacing: 1px; margin: 0; }
  .addr { font-size: 10.5pt; margin: 2px 0; }
  .brands { font-size: 10.5pt; margin: 2px 0; font-weight: 600; }
  .meta-row { display: flex; justify-content: space-between; margin-top: 14px; font-size: 11pt; }
  .meta-row .name { font-weight: 600; }
  .meta-row .range { font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1.4px solid #0E2A6B; padding: 8px 6px; font-size: 11pt; }
  th { background: #fff; color: #0E2A6B; font-weight: 700; }
  td.l { text-align: left; }
  td.c, th.c { text-align: center; }
  td.r, th.r { text-align: right; }
  td.l { padding-left: 10px; }
  .col-sn { width: 8%; }
  .col-p  { width: 42%; }
  .col-q  { width: 14%; }
  .col-r  { width: 16%; }
  .col-a  { width: 20%; }
  .total-row td { font-weight: 800; font-size: 12.5pt; }
  .footer { display: flex; justify-content: space-between; margin-top: 26px; font-size: 11pt; }
  .footer .left { }
  .footer .left .ty { font-style: italic; }
  .footer .right { text-align: right; }
  .sign-line { margin-top: 36px; border-top: 1px solid #000; width: 160px; display: inline-block; padding-top: 4px; }
</style>
</head>
<body>
  <div class="billdate">Bill Date: ${fmtDate(bill.billDate)}</div>
  <div class="header">
    <div class="agency">${SHOP.name}</div>
    <div class="addr">${SHOP.address}</div>
    <div class="brands">${SHOP.brands}</div>
  </div>

  <div class="meta-row">
    <div class="name">Name: ${escapeHtml(bill.customerName)}</div>
    <div class="range">FROM: ${fmtDate(bill.fromDate)} &nbsp;|&nbsp; TO: ${fmtDate(bill.toDate)}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="c col-sn">S.No.</th>
        <th class="c col-p">Particulars</th>
        <th class="c col-q">Qty.</th>
        <th class="c col-r">Rate</th>
        <th class="c col-a">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td class="l" colspan="4">TOTAL</td>
        <td class="r">Rs. ${bill.total.toFixed(1)}/-</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div class="left">
      <div class="ty">*Thank you, Visit Again</div>
      <div>Contact: ${SHOP.phone}</div>
    </div>
    <div class="right">
      <div>For SRS Agencies</div>
      <div class="sign-line">Signature</div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
