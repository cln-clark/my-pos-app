import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CartItem, TransactionItem } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface VATSummary {
  vatableSales: number;
  vatExemptSales: number;
  vatAmount12Pct: number;
  lessVat: number;
  seniorDiscountAmount: number;
  pwdDiscountAmount: number;
  athleteDiscountAmount: number;
  regularDiscountAmount: number;
  grossSales: number;
  netSales: number;
}

export function calculateVATSummary(transactionItems: TransactionItem[], subtotal: number): VATSummary {
  // Vatable Sales should be net of VAT (divide by 1.12)
  const vatableSales = transactionItems.reduce((sum, item) => sum + item.vatableAmt, 0) / 1.12;
  const vatExemptSales = transactionItems.reduce((sum, item) => sum + item.vatExemptAmt, 0);
  const vatAmount12Pct = vatableSales * 0.12;
  const lessVat = transactionItems.reduce((sum, item) => sum + item.lessVat, 0);
  
  const seniorDiscountAmount = transactionItems.reduce((sum, item) => {
    return sum + (item.discountDescription === 'Senior Citizen' ? (item.discountAmount || 0) : 0);
  }, 0);
  
  const pwdDiscountAmount = transactionItems.reduce((sum, item) => {
    return sum + (item.discountDescription === 'PWD' ? (item.discountAmount || 0) : 0);
  }, 0);
  
  const athleteDiscountAmount = transactionItems.reduce((sum, item) => {
    return sum + (item.discountDescription === 'Athlete' ? (item.discountAmount || 0) : 0);
  }, 0);
  
  const regularDiscountAmount = transactionItems.reduce((sum, item) => {
    return sum + (item.discountDescription !== 'Senior Citizen' && 
                  item.discountDescription !== 'PWD' && 
                  item.discountDescription !== 'Athlete' ? (item.discountAmount || 0) : 0);
  }, 0);

  // BIR-compliant calculations
  const grossSales = subtotal;
  const netSales = grossSales - seniorDiscountAmount - pwdDiscountAmount - athleteDiscountAmount - regularDiscountAmount - lessVat;

  return {
    vatableSales,
    vatExemptSales,
    vatAmount12Pct,
    lessVat,
    seniorDiscountAmount,
    pwdDiscountAmount,
    athleteDiscountAmount,
    regularDiscountAmount,
    grossSales,
    netSales,
  };
}

export function calculateChange(amountTendered: number, total: number): number {
  return Math.round((amountTendered - total) * 100) / 100;
}

export function generateReceiptHTML(receiptText: string): string {
  return `
    <html>
    <head>
      <title>Receipt</title>
      <style>
        body { font-family: 'Courier New', monospace; white-space: pre; padding: 20px; font-size: 12px; }
      </style>
    </head>
    <body>${receiptText}</body>
    </html>
  `;
}

export function extractBeneficiaryInfo(cart: CartItem[]): { beneficiaryId?: string; beneficiaryName?: string } {
  const beneficiaryInfoItem = cart.find(item => item.beneficiaryId && item.beneficiaryName);
  return {
    beneficiaryId: beneficiaryInfoItem?.beneficiaryId,
    beneficiaryName: beneficiaryInfoItem?.beneficiaryName,
  };
}
