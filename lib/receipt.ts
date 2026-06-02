import { Transaction, TransactionHistoryResponse } from './types';

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

export interface TransactionDetailResponse {
  invoice_no: number;
  transaction_no: number;
  transaction_date: string;
  transaction_time: string;
  business_date: string;
  cashier_name: string;
  payment_method: string;
  total: number;
  cash_amount_paid: number | null;
  change_given: number | null;
  subtotal: number;
  tax: number;
  vatable_sales: number;
  vat_exempt_sales: number;
  vat_amount_12_pct: number;
  less_vat: number;
  senior_discount_amount: number;
  pwd_discount_amount: number;
  athlete_discount_amount: number;
  regular_discount_amount: number;
  gross_sales: number;
  net_sales: number;
  items: Array<{
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    discount_description: string | null;
    discount_amount: number;
    vatable_amt: number;
    vat_amt: number;
    less_vat: number;
    vat_exempt_amt: number;
    zero_rated_amt: number;
  }>;
  is_voided: boolean;
  voided_by_name: string | null;
  void_reason: string | null;
  void_date: string | null;
  void_time: string | null;
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

export interface TransactionDetailResponse {
  invoice_no: number;
  transaction_no: number;
  transaction_date: string;
  transaction_time: string;
  business_date: string;
  cashier_name: string;
  payment_method: string;
  total: number;
  cash_amount_paid: number | null;
  change_given: number | null;
  subtotal: number;
  tax: number;
  vatable_sales: number;
  vat_exempt_sales: number;
  vat_amount_12_pct: number;
  less_vat: number;
  senior_discount_amount: number;
  pwd_discount_amount: number;
  athlete_discount_amount: number;
  regular_discount_amount: number;
  gross_sales: number;
  net_sales: number;
  items: Array<{
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    discount_description: string | null;
    discount_amount: number;
    vatable_amt: number;
    vat_amt: number;
    less_vat: number;
    vat_exempt_amt: number;
    zero_rated_amt: number;
  }>;
  is_voided: boolean;
  voided_by_name: string | null;
  void_reason: string | null;
  void_date: string | null;
  void_time: string | null;
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
  receipt += '    Chino Roces Ave, Makati City, Metro Manila\n';
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
  receipt += '    Chino Roces Ave, Makati City, Metro Manila\n';
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

export function mapTransactionToReceiptData(transaction: TransactionDetailResponse): ReceiptData {
  return {
    invoiceNo: transaction.invoice_no,
    timestamp: new Date(`${transaction.transaction_date} ${transaction.transaction_time}`),
    cashierName: transaction.cashier_name,
    items: transaction.items.map(item => ({
      productName: item.product_name,
      quantity: item.quantity,
      price: item.unit_price,
      subtotal: item.subtotal,
      discountDescription: item.discount_description || undefined,
      discountAmount: item.discount_amount || undefined,
    })),
    subtotal: transaction.subtotal,
    tax: transaction.tax,
    total: transaction.total,
    paymentMethod: transaction.payment_method === 'cash' ? 'cash' : 'card',
    change: transaction.change_given || undefined,
    transactionNo: transaction.transaction_no.toString(),
    vatableSales: transaction.vatable_sales,
    vatExemptSales: transaction.vat_exempt_sales,
    vatAmount12Pct: transaction.vat_amount_12_pct,
    lessVat: transaction.less_vat,
    seniorDiscountAmount: transaction.senior_discount_amount,
    pwdDiscountAmount: transaction.pwd_discount_amount,
    athleteDiscountAmount: transaction.athlete_discount_amount,
    regularDiscountAmount: transaction.regular_discount_amount,
    grossSales: transaction.gross_sales,
    netSales: transaction.net_sales,
  };
}

export function mapTransactionToReceiptDataFromState(transaction: Transaction): ReceiptData {
  return {
    invoiceNo: parseInt(transaction.id),
    timestamp: transaction.timestamp,
    cashierName: transaction.cashierName,
    items: transaction.items.map(item => ({
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      subtotal: item.product.price * item.quantity,
      discountDescription: item.discountDescription,
      discountAmount: item.discountAmount,
    })),
    subtotal: transaction.subtotal,
    tax: transaction.tax,
    total: transaction.total,
    paymentMethod: transaction.paymentMethod,
    change: transaction.change,
    transactionNo: transaction.id,
    itemsSold: transaction.items.reduce((sum, item) => sum + item.quantity, 0),
    vatableSales: transaction.vatableSales,
    vatExemptSales: transaction.vatExemptSales,
    vatAmount12Pct: transaction.vatAmount12Pct,
    lessVat: transaction.lessVat,
    seniorDiscountAmount: transaction.seniorDiscountAmount,
    pwdDiscountAmount: transaction.pwdDiscountAmount,
    athleteDiscountAmount: transaction.athleteDiscountAmount,
    regularDiscountAmount: transaction.regularDiscountAmount,
    grossSales: transaction.grossSales,
    netSales: transaction.netSales,
  };
}

export function generateReceiptFromTransaction(transaction: TransactionDetailResponse): string {
  if (transaction.is_voided) {
    return generateVoidReceiptText({
      originalTransactionNo: transaction.transaction_no.toString(),
      voidTransactionNo: transaction.transaction_no.toString(),
      timestamp: new Date(),
      voidedBy: transaction.voided_by_name || 'Unknown',
      voidReason: transaction.void_reason || 'Not specified',
      originalTotal: transaction.total,
      originalPaymentMethod: transaction.payment_method === 'cash' ? 'cash' : 'card',
      originalInvoiceNo: transaction.invoice_no.toString(),
    });
  }
  
  const receiptData = mapTransactionToReceiptData(transaction);
  return generateReceiptText(receiptData);
}
