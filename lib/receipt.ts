export interface ReceiptData {
  invoiceNo: number;
  timestamp: Date;
  cashierName: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
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
  guestCount?: number;
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
  const guestCount = data.guestCount || 1;

  let receipt = '';

  // Top border
  receipt += '================================================\n';

  // Company Header
  receipt += '                 RETAILPOS\n';
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
    const qty = item.quantity.toString().padStart(4);  // 4 chars
    const price = `₱${item.price.toFixed(2)}`.padStart(12);   // 12 chars
    const subtotal = `₱${item.subtotal.toFixed(2)}`.padStart(12); // 12 chars

    receipt += `${name}${qty}${price}${subtotal}\n`;
  });

  receipt += '------------------------------------------------\n'; // 48 dashes

const WIDTH = 48;  // match your total line width

const moneyLine = (label: string, value: number): string =>
    `${label}`.padEnd(20) + `₱${value.toFixed(2)}`.padStart(WIDTH - 20);

// Totals (now aligned to item table width)
receipt += '\n';
receipt += moneyLine('Subtotal', data.subtotal) + '\n';
receipt += moneyLine('Discount', discount) + '\n';
receipt += moneyLine('VAT', data.tax) + '\n';
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
  receipt += `Guest Count: ${guestCount}\n`;
  receipt += '================================================\n\n';

  receipt += 'THIS SERVES AS YOUR OFFICIAL RECEIPT\n\n';
  receipt += 'Thank you for shopping!\n';
  receipt += 'Please come again.\n\n';

  receipt += '================================================\n';

  return receipt;
}
