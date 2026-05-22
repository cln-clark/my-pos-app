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
}

// Transactions and Sales
export type PaymentMethod = 'cash' | 'card';
export type TxnMode = 'dine-in' | 'takeout';

export interface Transaction {
  id: string;
  cashierUserCode: string;
  cashierName: string;
  timestamp: Date;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  change?: number;
  txnMode?: TxnMode;
  businessDate?: string;
  terminalId?: number;
  cashAmountPaid?: number;
  encodedByUserCode?: string;
  printedByUserCode?: string;
}