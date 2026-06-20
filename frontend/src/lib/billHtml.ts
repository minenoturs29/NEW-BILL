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
      const zebra = idx % 2 === 1 ? 'zebra' : '';
      return `<tr class="${zebra}">
        <td class="c sn">${idx + 1}</td>
        <td class="l part">${escapeHtml(it.name)}</td>
        <td class="c qty">${escapeHtml(it.qty)}</td>
        <td class="c rate">${escapeHtml(it.rate)}</td>
        <td class="r amt">${amt.toFixed(1)}</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; background: #EEF2F8; font-family: Helvetica, Arial, sans-serif; color: #111; }

  .page {
    width: 100%;
    min-height: 100vh;
    padding: 18px;
    background: #EEF2F8;
  }

  .invoice {
    background: #ffffff;
    border: 3px solid #0E2A6B;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(14, 42, 107, 0.15);
  }

  /* ===== Header strip ===== */
  .strip {
    background: linear-gradient(135deg, #0E2A6B 0%, #1E4B9E 100%);
    color: #fff;
    padding: 22px 26px 18px 26px;
    position: relative;
  }
  .strip::after {
    content: "";
    display: block;
    height: 5px;
    background: #F5C518;
    margin: 14px -26px -18px -26px;
  }
  .agency {
    font-size: 30pt;
    font-weight: 900;
    letter-spacing: 2px;
    margin: 0;
    text-align: center;
    text-shadow: 0 1px 0 rgba(0,0,0,0.15);
  }
  .addr {
    text-align: center;
    font-size: 10.5pt;
    margin: 4px 0 0 0;
    opacity: 0.92;
  }
  .brands {
    text-align: center;
    font-size: 10.5pt;
    margin: 2px 0 0 0;
    font-weight: 700;
    letter-spacing: 0.4px;
    color: #FFE8A1;
  }

  /* ===== Meta strip ===== */
  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 26px;
    background: #F4F6FB;
    border-bottom: 1.5px solid #D6DDEC;
    font-size: 10.5pt;
    flex-wrap: wrap;
    gap: 6px;
  }
  .meta .pill {
    display: inline-block;
    background: #ffffff;
    border: 1.2px solid #0E2A6B;
    color: #0E2A6B;
    padding: 5px 12px;
    border-radius: 999px;
    font-weight: 700;
  }
  .meta .left, .meta .right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

  /* ===== Customer ===== */
  .cust {
    padding: 14px 26px 6px 26px;
    font-size: 11pt;
  }
  .cust .label {
    color: #6B7280;
    font-size: 9.5pt;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .cust .value {
    font-size: 15pt;
    font-weight: 800;
    color: #0E2A6B;
  }

  /* ===== Table ===== */
  .tablewrap { padding: 8px 26px 0 26px; }
  table { width: 100%; border-collapse: collapse; }
  thead th {
    background: #0E2A6B;
    color: #fff;
    font-weight: 800;
    font-size: 10.5pt;
    padding: 10px 8px;
    letter-spacing: 0.4px;
    border: 1.2px solid #0E2A6B;
  }
  tbody td {
    border: 1.2px solid #0E2A6B;
    padding: 9px 8px;
    font-size: 11pt;
    color: #111;
    background: #fff;
  }
  tbody tr.zebra td { background: #F7F9FD; }
  td.l { text-align: left; padding-left: 12px; }
  td.c, th.c { text-align: center; }
  td.r, th.r { text-align: right; padding-right: 12px; }
  th.sn, td.sn { width: 8%; }
  th.part, td.part { width: 44%; }
  th.qty, td.qty { width: 13%; }
  th.rate, td.rate { width: 15%; }
  th.amt, td.amt { width: 20%; font-weight: 700; }

  tfoot .total-cell {
    background: #FFF7DA;
    border: 1.6px solid #0E2A6B;
    padding: 14px 12px;
    font-size: 13pt;
    font-weight: 900;
    color: #0E2A6B;
    letter-spacing: 0.4px;
  }
  tfoot .total-label { text-align: right; padding-right: 14px; }
  tfoot .total-amt { text-align: right; }

  /* ===== Footer ===== */
  .footer {
    margin-top: 8px;
    padding: 18px 26px 22px 26px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 14px;
    flex-wrap: wrap;
  }
  .ty { font-style: italic; font-size: 10.5pt; color: #0E2A6B; font-weight: 600; }
  .contact { font-size: 10.5pt; margin-top: 4px; color: #111; font-weight: 600; }
  .contact b { color: #0E2A6B; }
  .sign-block { text-align: right; }
  .sign-for { font-size: 10.5pt; color: #111; font-weight: 700; }
  .sign-line {
    margin-top: 36px;
    border-top: 1.5px solid #0E2A6B;
    width: 170px;
    margin-left: auto;
  }
  .sign-cap { font-size: 10pt; margin-top: 3px; color: #4B5563; font-weight: 600; }

  .ribbon {
    background: #0E2A6B;
    color: #FFE8A1;
    text-align: center;
    font-size: 9.5pt;
    letter-spacing: 1.5px;
    padding: 8px;
    font-weight: 700;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="invoice">
      <!-- Header strip -->
      <div class="strip">
        <div class="agency">${SHOP.name}</div>
        <div class="addr">${SHOP.address}</div>
        <div class="brands">${SHOP.brands}</div>
      </div>

      <!-- Meta strip: bill date + range -->
      <div class="meta">
        <div class="left">
          <span class="pill">Bill Date: ${fmtDate(bill.billDate)}</span>
        </div>
        <div class="right">
          <span class="pill">FROM: ${fmtDate(bill.fromDate)}</span>
          <span class="pill">TO: ${fmtDate(bill.toDate)}</span>
        </div>
      </div>

      <!-- Customer -->
      <div class="cust">
        <div class="label">Bill To</div>
        <div class="value">${escapeHtml(bill.customerName)}</div>
      </div>

      <!-- Items table -->
      <div class="tablewrap">
        <table>
          <thead>
            <tr>
              <th class="c sn">S.No.</th>
              <th class="c part">Particulars</th>
              <th class="c qty">Qty.</th>
              <th class="c rate">Rate</th>
              <th class="c amt">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
          <tfoot>
            <tr>
              <td class="total-cell total-label" colspan="4">TOTAL</td>
              <td class="total-cell total-amt">Rs. ${bill.total.toFixed(1)}/-</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div>
          <div class="ty">*Thank you, Visit Again</div>
          <div class="contact">Contact: <b>${SHOP.phone}</b></div>
        </div>
        <div class="sign-block">
          <div class="sign-for">For SRS Agencies</div>
          <div class="sign-line"></div>
          <div class="sign-cap">Authorised Signature</div>
        </div>
      </div>

      <div class="ribbon">SRS Agencies &nbsp;•&nbsp; Pure Quality Milk &amp; Dairy</div>
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
