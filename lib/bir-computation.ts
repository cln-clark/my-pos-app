/**
 * BIR Computation Reference for FastPOS
 * Implements Philippine Bureau of Internal Revenue tax computation standards
 */

// VAT Constants
export const VAT_RATE = 0.12;
export const VAT_DIVISOR = 1.12;

// Discount Constants
export const SENIOR_PWD_DISCOUNT_RATE = 0.20;
export const ATHLETE_DISCOUNT_RATE = 0.20;

/**
 * VAT Basic Calculations
 */
export function calculateBasePrice(price: number): number {
  return price / VAT_DIVISOR;
}

export function calculateVATAmount(basePrice: number): number {
  return basePrice * VAT_RATE;
}

export function calculateVATFromGross(grossPrice: number): number {
  const basePrice = calculateBasePrice(grossPrice);
  return calculateVATAmount(basePrice);
}

/**
 * Senior/PWD Discount - Entire Bill
 * Senior Discount = (Total / 1.12) * 0.20
 */
export function calculateSeniorPWDDiscountEntireBill(total: number): number {
  return (total / VAT_DIVISOR) * SENIOR_PWD_DISCOUNT_RATE;
}

/**
 * Athlete Discount
 * Athlete Discount = (Total * 0.20) / 1.12
 */
export function calculateAthleteDiscount(total: number): number {
  return (total * ATHLETE_DISCOUNT_RATE) / VAT_DIVISOR;
}

/**
 * Regular Discount
 * Discount Amount = Total * (Discount% / 100)
 */
export function calculateRegularDiscount(total: number, discountPercent: number): number {
  return total * (discountPercent / 100);
}

/**
 * Service Charge
 * Service Charge = Total * (ServiceCharge% / 100)
 */
export function calculateServiceCharge(total: number, serviceChargePercent: number): number {
  return total * (serviceChargePercent / 100);
}

/**
 * Senior/PWD Sharing (Portioning) - VAT Registered
 * For VAT-registered establishments with Senior/PWD sharing
 */
export interface PortioningResult {
  portionUnitPrice: number;
  regPortionGross: number;
  discPortionGross: number;
  vatableAmt: number;
  vatExemptAmt: number;
  vatAmount: number;
  seniorDiscount: number;
  totalDue: number;
  regPortionQty: number;
}

export function calculateSeniorPWDPortioning(
  itemPrice: number,
  totalPortion: number,
  discPortionQty: number
): PortioningResult {
  const regPortionQty = totalPortion - discPortionQty;
  const portionUnitPrice = itemPrice / totalPortion;
  const regPortionGross = portionUnitPrice * regPortionQty;
  const discPortionGross = portionUnitPrice * discPortionQty;
  
  const vatableAmt = regPortionGross / VAT_DIVISOR;
  const vatExemptAmt = discPortionGross / VAT_DIVISOR;
  const vatAmount = vatableAmt * VAT_RATE;
  const seniorDiscount = vatExemptAmt * SENIOR_PWD_DISCOUNT_RATE;
  const totalDue = itemPrice - seniorDiscount;
  
  return {
    portionUnitPrice,
    regPortionGross,
    discPortionGross,
    vatableAmt,
    vatExemptAmt,
    vatAmount,
    seniorDiscount,
    totalDue,
    regPortionQty,
  };
}

/**
 * Non-VAT Registered Senior/PWD Sharing
 * VAT Exempt Sales = Gross / TotalPortion * DiscPortionQty
 * Senior Discount = VAT Exempt Sales * 0.20
 */
export interface NonVATPortioningResult {
  vatExemptSales: number;
  seniorDiscount: number;
}

export function calculateNonVATSeniorPWDPortioning(
  gross: number,
  totalPortion: number,
  discPortionQty: number
): NonVATPortioningResult {
  const vatExemptSales = (gross / totalPortion) * discPortionQty;
  const seniorDiscount = vatExemptSales * SENIOR_PWD_DISCOUNT_RATE;
  
  return {
    vatExemptSales,
    seniorDiscount,
  };
}

/**
 * Sales Breakdown Calculations
 */
export interface SalesBreakdown {
  vatableSales: number;
  vatExemptSales: number;
  vatAmount: number;
  zeroRatedSales: number;
  seniorDiscount: number;
  pwdDiscount: number;
  athleteDiscount: number;
  regularDiscount: number;
  grossSales: number;
  netSales: number;
  lessVat: number;
}

export function calculateSalesBreakdown(
  totalSales: number,
  seniorDiscount: number = 0,
  pwdDiscount: number = 0,
  athleteDiscount: number = 0,
  regularDiscount: number = 0,
  vatExemptSales: number = 0,
  zeroRatedSales: number = 0
): SalesBreakdown {
  // Less VAT is the VAT portion of Senior/PWD discounts
  const lessVat = (seniorDiscount + pwdDiscount) * VAT_RATE;
  
  // Gross Sales = Vatable Sales + VAT Exempt Sales + Less VAT + VAT Amount
  // Rearranging: Vatable Sales = (Gross - VAT Exempt - Less VAT) / 1.12
  // But we need to calculate iteratively
  
  // Start with approximation
  let vatableSales = (totalSales - vatExemptSales - lessVat) / VAT_DIVISOR;
  const vatAmount = vatableSales * VAT_RATE;
  
  // Gross Sales = Vatable Sales + VAT Exempt Sales + Less VAT + VAT Amount
  const grossSales = vatableSales + vatExemptSales + lessVat + vatAmount;
  
  // Net Sales = Vatable Sales + VAT Exempt Sales + VAT Amount - Senior Discount - PWD Discount - Athlete Discount - Regular Discount
  const netSales = vatableSales + vatExemptSales + vatAmount - seniorDiscount - pwdDiscount - athleteDiscount - regularDiscount;
  
  return {
    vatableSales,
    vatExemptSales,
    vatAmount,
    zeroRatedSales,
    seniorDiscount,
    pwdDiscount,
    athleteDiscount,
    regularDiscount,
    grossSales,
    netSales,
    lessVat,
  };
}

/**
 * Alternative calculation from Net Sales
 * Vatable Sales = (Net Sales - VAT Exempt Sales + Senior Discount + PWD Discount) / 1.12
 */
export function calculateVatableSalesFromNet(
  netSales: number,
  vatExemptSales: number,
  seniorDiscount: number,
  pwdDiscount: number
): number {
  return (netSales - vatExemptSales + seniorDiscount + pwdDiscount) / VAT_DIVISOR;
}

/**
 * VAT Exempt Sales from Net Sales
 * VAT Exempt Sales = Net Sales - Vatable Sales - VAT Amount + Senior Discount + PWD Discount
 */
export function calculateVatExemptFromNet(
  netSales: number,
  vatableSales: number,
  vatAmount: number,
  seniorDiscount: number,
  pwdDiscount: number
): number {
  return netSales - vatableSales - vatAmount + seniorDiscount + pwdDiscount;
}

/**
 * Z-Reading Report Calculations
 * Gross Sales = Total Sales + Total Discount + Less VAT (PWD/Senior)
 * Net Sales = Total Sales - VAT Amount
 */
export interface ZReadingReport {
  grossSales: number;
  netSales: number;
  totalSales: number;
  totalDiscount: number;
  lessVat: number;
  vatAmount: number;
}

export function calculateZReading(
  totalSales: number,
  totalDiscount: number,
  lessVat: number
): ZReadingReport {
  const grossSales = totalSales + totalDiscount + lessVat;
  const vatAmount = calculateVATFromGross(totalSales);
  const netSales = totalSales - vatAmount;
  
  return {
    grossSales,
    netSales,
    totalSales,
    totalDiscount,
    lessVat,
    vatAmount,
  };
}

/**
 * Item-level VAT Breakdown
 */
export interface ItemVATBreakdown {
  vatAmount: number;
  vatableAmt: number;
  vatExemptAmt: number;
  zeroRatedAmt: number;
  lessVat: number;
  isVatExempt: boolean;
  isScpwdDiscount: boolean;
  discountAmount: number;
  discountDescription: string;
}

export interface ItemVATBreakdownParams {
  itemPrice: number;
  quantity: number;
  discountQty: number;
  discountName: string | null;
  discountPercent: number | null;
  discountMode?: 'per-item' | 'portioning';
  totalPortion?: number;
  regularPortionDiscount?: number;
}

export function calculateItemVATBreakdown(params: ItemVATBreakdownParams): ItemVATBreakdown {
  const {
    itemPrice,
    quantity,
    discountQty,
    discountName,
    discountPercent,
    discountMode = 'per-item',
    totalPortion,
    regularPortionDiscount,
  } = params;

  let discountAmount = 0;
  let isVatExempt = false;
  let isScpwdDiscount = false;
  let vatableAmt = 0;
  let vatAmount = 0;
  let lessVat = 0;
  let vatExemptAmt = 0;
  const zeroRatedAmt = 0; // Currently not supported

  // Calculate discount based on mode
  if (discountName && discountQty > 0) {
    if (discountName === 'Senior Citizen' || discountName === 'PWD') {
      isScpwdDiscount = true;

      if (discountMode === 'portioning' && totalPortion) {
        // Portioning mode: VAT-registered Senior/PWD sharing
        const regPortionQty = totalPortion - discountQty;
        const portionUnitPrice = itemPrice / totalPortion;
        const regPortionGross = portionUnitPrice * regPortionQty;
        const discPortionGross = portionUnitPrice * discountQty;

        vatableAmt = regPortionGross / VAT_DIVISOR;
        vatExemptAmt = discPortionGross / VAT_DIVISOR;
        vatAmount = vatableAmt * VAT_RATE;
        lessVat = discPortionGross - vatExemptAmt; // VAT portion baked in the price
        discountAmount = vatExemptAmt * SENIOR_PWD_DISCOUNT_RATE;

        // Apply regular portion discount if specified
        if (regularPortionDiscount && regularPortionDiscount > 0) {
          const regularDiscount = regPortionGross * (regularPortionDiscount / 100);
          discountAmount += regularDiscount;
        }

        isVatExempt = true;
      } else {
        // Per-item mode: (Eligible Amount / 1.12) * 0.20
        const eligibleAmount = itemPrice * discountQty;
        discountAmount = (eligibleAmount / VAT_DIVISOR) * SENIOR_PWD_DISCOUNT_RATE;
        isVatExempt = true;

        const nonDiscountedAmount = itemPrice * (quantity - discountQty);
        vatableAmt = nonDiscountedAmount;
        vatAmount = vatableAmt * VAT_RATE;
        lessVat = (eligibleAmount / VAT_DIVISOR) * VAT_RATE;
        vatExemptAmt = eligibleAmount / VAT_DIVISOR;
      }
    } else if (discountName === 'Athlete') {
      // Athlete discount: (Eligible Amount * 0.20) / 1.12
      const eligibleAmount = itemPrice * discountQty;
      discountAmount = (eligibleAmount * ATHLETE_DISCOUNT_RATE) / VAT_DIVISOR;
      isVatExempt = true;

      const nonDiscountedAmount = itemPrice * (quantity - discountQty);
      vatableAmt = nonDiscountedAmount;
      vatAmount = vatableAmt * VAT_RATE;
      lessVat = (eligibleAmount / VAT_DIVISOR) * VAT_RATE;
      vatExemptAmt = eligibleAmount / VAT_DIVISOR;
    } else if (discountPercent) {
      // Regular discount: Eligible Amount * (Discount % / 100)
      const eligibleAmount = itemPrice * discountQty;
      discountAmount = eligibleAmount * (discountPercent / 100);

      vatableAmt = itemPrice * quantity;
      vatAmount = vatableAmt * VAT_RATE;
    }
  } else {
    // No discount
    vatableAmt = itemPrice * quantity;
    vatAmount = vatableAmt * VAT_RATE;
  }

  return {
    vatAmount: roundTo5Decimals(vatAmount),
    vatableAmt: roundTo5Decimals(vatableAmt),
    vatExemptAmt: roundTo5Decimals(vatExemptAmt),
    zeroRatedAmt: roundTo5Decimals(zeroRatedAmt),
    lessVat: roundTo5Decimals(lessVat),
    isVatExempt,
    isScpwdDiscount,
    discountAmount: roundTo5Decimals(discountAmount),
    discountDescription: discountName || 'No Discount',
  };
}

/**
 * Utility function to round to 5 decimal places for BIR compliance
 */
export function roundTo5Decimals(value: number): number {
  return Math.round(value * 100000) / 100000;
}

/**
 * Utility function to round to 2 decimal places for display
 */
export function roundTo2Decimals(value: number): number {
  return Math.round(value * 100) / 100;
}
