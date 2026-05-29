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
  discountCode?: number; // Per-item discount code
  discountMode?: 'per-item' | 'portioning'; // Discount mode for SC/PWD
  totalPortion?: number; // Total portion for portioning discount
  regularPortionDiscount?: number; // Regular portion discount % for portioning
  beneficiaryId?: string; // Beneficiary ID for SC/PWD/Athlete discounts
  beneficiaryName?: string; // Beneficiary name for SC/PWD/Athlete discounts
  newlyAdded?: number; // Timestamp when item was added (for visual emphasis)
}

// Transaction Item with VAT Breakdown
export interface TransactionItem {
  product: Product;
  quantity: number;
  discountQty: number;
  discountCode?: number;
  // Beneficiary information for SC/PWD/Athlete discounts
  beneficiaryId?: string;
  beneficiaryName?: string;
  // BIR Computation Fields (simplified)
  vatAmount: number;
  vatableAmt: number;
  vatExemptAmt: number;
  zeroRatedAmt: number;
  lessVat: number;
  isVatExempt: boolean;
  isScpwdDiscount: boolean;
  // Additional computed fields for display
  discountAmount?: number;
  discountDescription?: string;
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
  discountCode?: number;
  encodedByUserCode?: string;
  printedByUserCode?: string;
  invoiceNumber?: string;
  cardPaymentData?: {
    cardNumber: string;
    cardHolderName: string;
    cardType: string;
    approvalCode: string;
    traceNo: string;
    terminalRefNo: string;
  };
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
  lessVat: number;
  serviceChargeAmount?: number;
  // Void-related fields
  transactionType?: 'SALE' | 'VOID';
  voidTxNum?: number;
  voidedByUserCode?: string;
  voidReason?: string;
}