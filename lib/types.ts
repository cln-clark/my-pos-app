export type UserRole = 'cashier' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pin: string; // For demo purposes only
}

// Products and Inventory
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  description?: string;
}

// Shopping Cart
export interface CartItem {
  product: Product;
  quantity: number;
}

// Transactions and Sales
export type PaymentMethod = 'cash' | 'card' | 'both';

export interface Transaction {
  id: string;
  cashierId: string;
  cashierName: string;
  timestamp: Date;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  change?: number;
}