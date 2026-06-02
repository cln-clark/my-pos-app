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
  cardPaymentData?: CardPaymentData;
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

// Card Payment Data
export interface CardPaymentData {
  cardNumber: string;
  cardHolderName: string;
  cardType: string;
  approvalCode: string;
  traceNo: string;
  terminalRefNo: string;
}

// Backend Request/Response Types
export interface TransactionItemRequest {
  company_code: number;
  store_code: number;
  terminal_id: number;
  product_id: number;
  sku: string;
  product_name: string;
  line_sequence: number;
  qty: number;
  unit_price_incl_tax: number;
  discount_percent: number;
  price_before_disc: number;
  invoice_no: number;
  txn_mode_code: number;
  is_vat_exempt: boolean;
  price_before_less_vat: number;
  is_scpwd_disc: boolean;
  ordered_date: string;
  ordered_time: string;
  discount_code?: number;
  disc_description?: string;
  vatable_amt: number;
  vat_amt: number;
  less_vat: number;
  vat_exempt_amt: number;
  zero_rated_amt: number;
  disc_amt: number;
  charge_amt: number;
  total_portion_qty: number;
  disc_portion_qty: number;
  business_date: string;
  category_code: string;
}

export interface TransactionRequest {
  company_code: number;
  store_code: number;
  terminal_id: number;
  cashier_user_code: number;
  total: number;
  payment_method: string;
  change_given?: number;
  transaction_date: string;
  transaction_time: string;
  txn_mode_code: number;
  business_date: string;
  cash_amount_paid?: number;
  encoded_by_user_code: number;
  printed_by_user_code: number;
  items: TransactionItemRequest[];
}

export interface PosZxReadingRequest {
  company_code: number;
  store_code: number;
  terminal_id: number;
  transaction_no: number;
  invoice_number: number;
  business_date: string;
  payment_type: number;
  amount: number;
  discount_pct: number;
  local_tax: number;
  service_charge: number;
  take_out_charge: number;
  delivery_charge: number;
  card_cheque_num: string;
  card_holder_name: string;
  trace_no: number;
  approval_code: string;
  terminal_ref_no: string;
  transaction_type: string;
  void_tx_num: number;
  discount_code?: number;
  sr_pwd_id: string;
  osca_pwd_name: string;
  is_vat_exempt: boolean;
  sr_pwd_vat_exempt_sale: number;
  sr_pwd_total_amount: number;
  sr_pwd_count: number;
  cashier_user_code: string;
  date_stamp: string;
  time_stamp: string;
  voided_by_user_code: string;
  void_reason: string;
}

export interface VoidTransactionRequest {
  original_transaction_no: number;
  voided_by_user_code: string;
  void_reason: string;
  company_code: number;
  store_code: number;
  terminal_id: number;
  business_date: string;
}

export interface ExchangeItemRequest {
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount_description?: string;
  discount_amount?: number;
}

export interface ExchangeTransactionRequest {
  original_invoice_no: number;
  original_transaction_no: number;
  items: ExchangeItemRequest[];
  cashier_user_code: number;
  payment_method: string;
  cash_amount_paid?: number;
  company_code: number;
  store_code: number;
  terminal_id: number;
  business_date: string;
}

// Rust Backend Response Types
export interface UserResponse {
  id: number;
  name: string;
  email?: string;
  role_id: number;
  pin: string;
}

export interface RoleResponse {
  id: number;
  role_name: string;
}

export interface ProductResponse {
  id: number;
  sku: string;
  name: string;
  price: number;
  category_id?: number;
  stock: number;
  description?: string;
}

export interface CategoryResponse {
  id: number;
  category_code: string;
  category_name: string;
}

export interface DiscountCodeResponse {
  id: number;
  name: string;
  percent: number;
}

export interface TransactionResponse {
  id: number;
  cashier_user_code: number;
  total: number;
  payment_method: string;
  change_given?: number;
  transaction_date: string;
  transaction_time: string;
  invoice_number: string;
}

export interface TransactionHistoryResponse {
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
  is_voided: boolean;
  voided_by_name?: string | null;
  void_reason?: string | null;
  void_date?: string | null;
  void_time?: string | null;
}