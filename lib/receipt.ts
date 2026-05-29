export interface ReceiptData {
  invoiceNo: number;
  timestamp: Date;
  cashierName: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
    discountDescription?: string;
    discountAmount?: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card';
  change?: number;
  transactionNo?: string;
  orNo?: string;
  discount?: number;
  itemsSold?: number;
  // VAT breakdown
  vatableSales?: number;
  vatExemptSales?: number;
  vatAmount12Pct?: number;
  lessVat?: number;
  seniorDiscountAmount?: number;
  pwdDiscountAmount?: number;
  athleteDiscountAmount?: number;
  regularDiscountAmount?: number;
  grossSales?: number;
  netSales?: number;
}

export interface VoidReceiptData {
  originalTransactionNo: string;
  voidTransactionNo: string;
  timestamp: Date;
  voidedBy: string;
  voidReason: string;
  originalTotal: number;
  originalPaymentMethod: 'cash' | 'card';
  originalInvoiceNo: string;
}

export function generateReceiptText(data: ReceiptData): string {
  const year = data.timestamp.getFullYear();
  const txnNo = data.transactionNo || `TXN-${year}-${String(data.invoiceNo).padStart(6, '0')}`;
  const invNo = `INV-${year}-${String(data.invoiceNo).padStart(6, '0')}`;
  const orNo = data.orNo || String(data.invoiceNo).padStart(8, '0');
  const dateStr = data.timestamp.toLocaleDateString();
  const timeStr = data.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const discount = data.discount || 0;
  const itemsSold = data.itemsSold || data.items.reduce((sum, item) => sum + item.quantity, 0);

  let receipt = '';

  // Top border
  receipt += '================================================\n';

  // Company Header 
  receipt += '                 FASTPOS\n';
  receipt += '          Point of Sale System\n';
  receipt += '        Quiapo, Manila, Philippines\n';
  receipt += '================================================\n\n';

  // Receipt Title
  receipt += 'SALES INVOICE / RECEIPT\n\n';

  // Transaction Details
  receipt += `Transaction No : ${txnNo}\n`;
  receipt += `Invoice No     : ${invNo}\n`;
  receipt += `OR No          : ${orNo}\n\n`;

  receipt += `Date           : ${dateStr}\n`;
  receipt += `Time           : ${timeStr}\n`;
  receipt += `Cashier        : ${data.cashierName}\n\n`;

  // Items Header
  receipt += '------------------------------------------------\n';
  receipt += 'ITEM               QTY         PRICE       TOTAL\n';
  receipt += '------------------------------------------------\n';
  // Items
  data.items.forEach((item) => {
    const name = item.productName.padEnd(20);      // 20 chars
    const qty = item.quantity.toString().padStart(2);  // 2 chars
    const price = `₱${item.price.toFixed(2)}`.padStart(14);   // 14 chars
    const subtotal = `₱${item.subtotal.toFixed(2)}`.padStart(12); // 12 chars

    receipt += `${name}${qty}${price}${subtotal}\n`;
    if (item.discountDescription && item.discountAmount) {
      const discLabel = `  Disc: ${item.discountDescription}`.padEnd(20);
      const discAmount = `-₱${item.discountAmount.toFixed(2)}`.padStart(28);
      receipt += `${discLabel}${discAmount}\n`;
    }
  });

  receipt += '------------------------------------------------\n'; // 48 dashes

const WIDTH = 48;  // match your total line width

const moneyLine = (label: string, value: number): string =>
    `${label}`.padEnd(20) + `₱${value.toFixed(2)}`.padStart(WIDTH - 20);

// Totals (now aligned to item table width)
receipt += '\n';
receipt += moneyLine('Subtotal', data.subtotal) + '\n';

// VAT Breakdown
if (data.vatableSales !== undefined && data.vatableSales > 0) {
  receipt += moneyLine('Vatable Sales', data.vatableSales) + '\n';
}
if (data.vatExemptSales !== undefined && data.vatExemptSales > 0) {
  receipt += moneyLine('VAT Exempt Sales', data.vatExemptSales) + '\n';
}
if (data.lessVat !== undefined && data.lessVat > 0) {
  receipt += moneyLine('Less VAT', data.lessVat) + '\n';
}
if (data.vatAmount12Pct !== undefined && data.vatAmount12Pct > 0) {
  receipt += moneyLine('VAT (12%)', data.vatAmount12Pct) + '\n';
}

// Discount Breakdown
if (data.seniorDiscountAmount !== undefined && data.seniorDiscountAmount > 0) {
  receipt += moneyLine('Senior Discount', data.seniorDiscountAmount) + '\n';
}
if (data.pwdDiscountAmount !== undefined && data.pwdDiscountAmount > 0) {
  receipt += moneyLine('PWD Discount', data.pwdDiscountAmount) + '\n';
}
if (data.athleteDiscountAmount !== undefined && data.athleteDiscountAmount > 0) {
  receipt += moneyLine('Athlete Discount', data.athleteDiscountAmount) + '\n';
}
if (data.regularDiscountAmount !== undefined && data.regularDiscountAmount > 0) {
  receipt += moneyLine('Regular', data.regularDiscountAmount) + '\n';
}

// Summary
if (data.grossSales !== undefined) {
  receipt += '------------------------------------------------\n';
  receipt += moneyLine('Gross Sales', data.grossSales) + '\n';
}
if (data.netSales !== undefined) {
  receipt += moneyLine('Net Sales', data.netSales) + '\n';
}

receipt += '------------------------------------------------\n';
receipt += moneyLine('TOTAL', data.total) + '\n\n';

// Payment
if (data.paymentMethod === 'cash') {
  const cashAmount = data.total + (data.change || 0);

  receipt += moneyLine('Cash', cashAmount) + '\n';

  if (data.change !== undefined) {
    receipt += moneyLine('Change', data.change) + '\n';
  }
}

  receipt += '================================================\n';
  receipt += `Items Sold : ${itemsSold}\n`;
  receipt += '================================================\n\n';

  receipt += 'THIS SERVES AS YOUR OFFICIAL RECEIPT\n\n';
  receipt += 'Thank you for shopping!\n';
  receipt += 'Please come again.\n\n';

  receipt += '================================================\n';

  return receipt;
}

export function generateVoidReceiptText(data: VoidReceiptData): string {
  const dateStr = data.timestamp.toLocaleDateString();
  const timeStr = data.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  let receipt = '';

  // Top border
  receipt += '================================================\n';

  // Company Header
  receipt += '                 FASTPOS\n';
  receipt += '          Point of Sale System\n';
  receipt += '        Quiapo, Manila, Philippines\n';
  receipt += '================================================\n\n';

  // Receipt Title
  receipt += '              VOID RECEIPT\n\n';

  // Transaction Details
  receipt += `Original TXN No : ${data.originalTransactionNo}\n`;
  receipt += `Void TXN No     : ${data.voidTransactionNo}\n`;
  receipt += `Original INV No : ${data.originalInvoiceNo}\n\n`;

  receipt += `Date/Time       : ${dateStr} ${timeStr}\n`;
  receipt += `Voided By       : ${data.voidedBy}\n`;
  receipt += `Void Reason     : ${data.voidReason}\n\n`;

  receipt += '------------------------------------------------\n';

  // Original Transaction Details
  const moneyLine = (label: string, value: number): string =>
    `${label}`.padEnd(20) + `₱${value.toFixed(2)}`.padStart(28);

  receipt += 'ORIGINAL TRANSACTION DETAILS\n';
  receipt += '------------------------------------------------\n';
  receipt += moneyLine('Original Total', data.originalTotal) + '\n';
  receipt += moneyLine('Payment Method', data.originalPaymentMethod === 'cash' ? 0 : 0) + '\n'; // Payment method as text
  receipt += `Payment Method : ${data.originalPaymentMethod.toUpperCase()}\n\n`;

  receipt += '------------------------------------------------\n';
  receipt += 'THIS DOCUMENT SERVES AS VOID RECEIPT\n';
  receipt += 'Original transaction has been voided.\n\n';

  receipt += 'Thank you.\n\n';

  receipt += '================================================\n';

  return receipt;
}
