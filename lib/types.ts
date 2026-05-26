export type UserRole = 1 | 2; // 1 = cashier, 2 = manager

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  pin: string; // For demo purposes only
}

// Products and Inventory
export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  categoryId?: number;
  category?: string;
  categoryCode?: string;
  stock: number;
  description?: string;
}

export interface Category {
  id: number;
  categoryCode: string;
  categoryName: string;
}

export interface Role {
  id: number;
  name: string;
}

// Shopping Cart
export interface CartItem {
  product: Product;
  quantity: number;
  discountQty: number; // Number of portions eligible for discount
  discountCodeId?: number; // Per-item discount code
}

// Transaction Item with VAT Breakdown
export interface TransactionItem {
  product: Product;
  quantity: number;
  discountQty: number;
  discountCodeId?: number;
  // VAT breakdown fields
  vatableAmt: number;
  vatAmount12Pct: number;
  lessVat12Pct: number;
  vatExemptAmt: number;
  discountAmount: number;
  chargeAmount: number;
  totalPortionQty: number;
  discountPortionQty: number;
  srAndOthersDiscPercent: number;
  discountCode: number;
  discountDescription: string;
}

// Transactions and Sales
export type PaymentMethod = 'cash' | 'card';
export type TxnMode = 'dine-in' | 'takeout';

export interface Transaction {
  id: string;
  cashierUserCode: string;
  cashierName: string;
  timestamp: Date;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  change?: number;
  txnMode?: TxnMode;
  businessDate?: string;
  terminalId?: number;
  cashAmountPaid?: number;
  discountCodeId?: number;
  encodedByUserCode?: string;
  printedByUserCode?: string;
  // VAT summary fields
  vatableSales: number;
  vatExemptSales: number;
  zeroRatedSales: number;
  vatAmount12Pct: number;
  seniorDiscountAmount: number;
  pwdDiscountAmount: number;
  athleteDiscountAmount: number;
  regularDiscountAmount: number;
  grossSales: number;
  netSales: number;
}