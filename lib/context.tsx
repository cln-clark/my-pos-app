'use client';

import React, { createContext, useContext, useState, useCallback, useEffect  } from "react";
import { User, Product, CartItem, Transaction, Category, TransactionItem } from './types';
import { getProducts, getCategories, getDiscountCodes, createTransaction as createTransactionData, loginUser as loginUserApi } from "./data";
import { invoke } from '@tauri-apps/api/core';
import { calculateItemVATBreakdown as calculateItemVAT, calculateSalesBreakdown, roundTo5Decimals } from './bir-computation';

interface POSContextType {
    currentUser: User | null;
    login: (userid: number, pin: string) => Promise<boolean>;
    logout: () => void;

    products: Product[];
    categories: Category[];
    discountCodes: Array<{ id: number; name: string; percent: number }>;
    cart: CartItem[];
    addToCart: (product: Product, quantity: number) => void;
    updateCartQuantity: (productId: string, quantity: number) =>  void;
    updateDiscountQty: (productId: string, discountQty: number) => void;
    setItemDiscountCode: (productId: string, discountCodeId: number | undefined) => void;
    setItemPortioningDiscount: (productId: string, discountCodeId: number | undefined, discountMode: 'per-item' | 'portioning' | undefined, totalPortion: number, discountQty: number, regularPortionDiscount: number) => void;
    setItemDiscountMode: (productId: string, discountMode: 'per-item' | 'portioning' | undefined) => void;
    setItemTotalPortion: (productId: string, totalPortion: number) => void;
    setItemRegularPortionDiscount: (productId: string, regularPortionDiscount: number) => void;
    removeFromCart: (productId: string) => void;
    getCartTotal: () => number;
    calculateDiscount: (cart: CartItem[]) => number;
    calculateItemVATBreakdown: (cartItem: CartItem) => TransactionItem;
    calculateTransactionVATSummary: (cart: CartItem[]) => Omit<Transaction, 'id' | 'cashierUserCode' | 'cashierName' | 'timestamp' | 'paymentMethod' | 'change' | 'txnMode' | 'businessDate' | 'terminalId' | 'cashAmountPaid' | 'discountCodeId' | 'encodedByUserCode' | 'printedByUserCode' | 'items'>;
    clearCart: () => void;

    transactions: Transaction[];
    createTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [discountCodes, setDiscountCodes] = useState<Array<{ id: number; name: string; percent: number }>>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        getProducts().then((data) => {
            setProducts(data);
        });
        getCategories().then((data) => {
            setCategories(data);
        });
        getDiscountCodes().then((data) => {
            setDiscountCodes(data);
        });
    }, []);

    const login = useCallback(async (cashierUserCode: number, pin: string): Promise<boolean> => {
        try {
            const user = await loginUserApi(cashierUserCode, pin);
            if (user) {
                setCurrentUser(user);
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }, []);

   const addToCart = useCallback((product: Product, quantity: number) => {
        setCart((prev) => {
            const existingItem = prev.find((item) => item.product.id === product.id)
            if(existingItem){
                return prev.map((item) =>
                        item.product.id === product.id ?
                            { ...item, quantity: item.quantity + quantity}
                            : item
            )};
            return [{ product, quantity, discountQty: 0, discountCodeId: undefined, discountMode: undefined, totalPortion: undefined, regularPortionDiscount: undefined }, ...prev]
        })
    }, []);
 
    
    const removeFromCart = useCallback((productId: string) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId))
    }, []);

    const updateCartQuantity = useCallback((productId: string, quantity: number) => {
        if(quantity <=0 ){
            setCart((prev) => prev.filter((item) => item.product.id !== productId))
        }
        else {
            setCart((prev) => prev.map((item) =>
                item.product.id === productId ?
                    { ...item, quantity }
                    : item
            ))
        }
    }, [])

    const updateDiscountQty = useCallback((productId: string, discountQty: number) => {
        setCart((prev) => prev.map((item) =>
            item.product.id === productId ?
                { ...item, discountQty: Math.min(discountQty, item.quantity) }
                : item
        ))
    }, [])

    const setItemDiscountCode = useCallback((productId: string, discountCodeId: number | undefined) => {
        setCart((prev) => prev.map((item) =>
            item.product.id === productId ?
                { ...item, discountCodeId, discountQty: discountCodeId ? item.quantity : 0, discountMode: undefined, totalPortion: undefined, regularPortionDiscount: undefined }
                : item
        ))
    }, [])

    const setItemPortioningDiscount = useCallback((productId: string, discountCodeId: number | undefined, discountMode: 'per-item' | 'portioning' | undefined, totalPortion: number, discountQty: number, regularPortionDiscount: number) => {
        setCart((prev) => prev.map((item) =>
            item.product.id === productId ?
                { ...item, discountCodeId, discountMode, totalPortion, discountQty, regularPortionDiscount }
                : item
        ))
    }, [])

    const setItemDiscountMode = useCallback((productId: string, discountMode: 'per-item' | 'portioning' | undefined) => {
        setCart((prev) => prev.map((item) =>
            item.product.id === productId ?
                { ...item, discountMode }
                : item
        ))
    }, [])

    const setItemTotalPortion = useCallback((productId: string, totalPortion: number) => {
        setCart((prev) => prev.map((item) =>
            item.product.id === productId ?
                { ...item, totalPortion }
                : item
        ))
    }, [])

    const setItemRegularPortionDiscount = useCallback((productId: string, regularPortionDiscount: number) => {
        setCart((prev) => prev.map((item) =>
            item.product.id === productId ?
                { ...item, regularPortionDiscount }
                : item
        ))
    }, [])

    const calculateItemVATBreakdown = useCallback((cartItem: CartItem): TransactionItem => {
        const discount = cartItem.discountCodeId ? discountCodes.find(d => d.id === cartItem.discountCodeId) : null;
        const itemPrice = cartItem.product.price;
        const quantity = cartItem.quantity;
        const discountQty = cartItem.discountQty;

        const vatBreakdown = calculateItemVAT({
            itemPrice,
            quantity,
            discountQty,
            discountName: discount?.name || null,
            discountPercent: discount?.percent || null,
            discountMode: cartItem.discountMode,
            totalPortion: cartItem.totalPortion,
            regularPortionDiscount: cartItem.regularPortionDiscount,
        });

        return {
            product: cartItem.product,
            quantity: cartItem.quantity,
            discountQty: cartItem.discountQty,
            discountCodeId: cartItem.discountCodeId,
            vatAmount: vatBreakdown.vatAmount,
            vatableAmt: vatBreakdown.vatableAmt,
            vatExemptAmt: vatBreakdown.vatExemptAmt,
            zeroRatedAmt: vatBreakdown.zeroRatedAmt,
            lessVat: vatBreakdown.lessVat,
            isVatExempt: vatBreakdown.isVatExempt,
            isScpwdDiscount: vatBreakdown.isScpwdDiscount,
            discountAmount: vatBreakdown.discountAmount,
            discountDescription: vatBreakdown.discountDescription,
        };
    }, [discountCodes])

    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    }, [cart])

    const calculateDiscount = useCallback((cart: CartItem[]) => {
        let totalDiscount = 0;
        for (const item of cart) {
            const vatBreakdown = calculateItemVATBreakdown(item);
            // For SC/PWD discounts, include Less VAT in the total discount
            // Total Due = ItemPrice - Senior Discount - Less VAT
            if (vatBreakdown.isScpwdDiscount) {
                totalDiscount += (vatBreakdown.discountAmount || 0) + (vatBreakdown.lessVat || 0);
            } else {
                totalDiscount += vatBreakdown.discountAmount || 0;
            }
        }
        return totalDiscount;
    }, [discountCodes, calculateItemVATBreakdown])

    const calculateTransactionVATSummary = useCallback((cart: CartItem[]) => {
        let seniorDiscount = 0;
        let pwdDiscount = 0;
        let athleteDiscount = 0;
        let regularDiscount = 0;
        let vatExemptSales = 0;
        let vatableSales = 0;
        let vatAmount = 0;

        for (const item of cart) {
            const vatBreakdown = calculateItemVATBreakdown(item);
            const discount = item.discountCodeId ? discountCodes.find(d => d.id === item.discountCodeId) : null;

            if (discount) {
                if (discount.name === 'Senior Citizen') {
                    seniorDiscount += vatBreakdown.discountAmount || 0;
                } else if (discount.name === 'PWD') {
                    pwdDiscount += vatBreakdown.discountAmount || 0;
                } else if (discount.name === 'Athlete') {
                    athleteDiscount += vatBreakdown.discountAmount || 0;
                } else {
                    regularDiscount += vatBreakdown.discountAmount || 0;
                }
            }

            vatExemptSales += vatBreakdown.vatExemptAmt;
            vatableSales += vatBreakdown.vatableAmt;
            vatAmount += vatBreakdown.vatAmount;
        }

        const totalSales = getCartTotal();
        const totalDiscount = seniorDiscount + pwdDiscount + athleteDiscount + regularDiscount;
        const lessVat = (seniorDiscount + pwdDiscount) * 0.12;

        const salesBreakdown = calculateSalesBreakdown(
            totalSales,
            seniorDiscount,
            pwdDiscount,
            athleteDiscount,
            regularDiscount,
            vatExemptSales,
            0 // zeroRatedSales
        );

        return {
            subtotal: totalSales,
            tax: vatAmount,
            total: totalSales - totalDiscount,
            vatableSales: salesBreakdown.vatableSales,
            vatExemptSales: salesBreakdown.vatExemptSales,
            zeroRatedSales: salesBreakdown.zeroRatedSales,
            vatAmount12Pct: salesBreakdown.vatAmount,
            seniorDiscountAmount: seniorDiscount,
            pwdDiscountAmount: pwdDiscount,
            athleteDiscountAmount: athleteDiscount,
            regularDiscountAmount: regularDiscount,
            grossSales: salesBreakdown.grossSales,
            netSales: salesBreakdown.netSales,
            lessVat: salesBreakdown.lessVat,
        };
    }, [discountCodes, calculateItemVATBreakdown, getCartTotal])

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const createTransaction = useCallback(
        async (transaction: Omit<Transaction, 'id'>) => {
            const companyCode = 1;
            const storeCode = 1;
            const terminalId = 1;
            const encodedByUserCode = transaction.cashierUserCode;
            const printedByUserCode = transaction.cashierUserCode;
            const cashAmountPaid = transaction.paymentMethod === 'cash' ? (transaction.total + (transaction.change || 0)) : null;
        try {
            // Fetch discount codes if not available
            const codes = discountCodes.length > 0 ? discountCodes : await getDiscountCodes();

            // Map txn_mode to code: dine-in = 1, takeout = 2
            const txn_mode_code = transaction.txnMode === 'takeout' ? 2 : 1;

            const items = transaction.items.map((item: any, index: number) => {
                const now = new Date();
                const discountCodeId = item.discountCodeId ? (typeof item.discountCodeId === 'string' ? parseInt(item.discountCodeId) : item.discountCodeId) : 4;
                const discount = codes.find(d => d.id === discountCodeId);
                return {
                    company_code: companyCode,
                    store_code: storeCode,
                    terminal_id: terminalId,
                    product_id: parseInt(item.product.id),
                    sku: item.product.sku,
                    product_name: item.product.name,
                    line_sequence: index + 1,
                    qty: item.quantity,
                    unit_price_incl_tax: item.product.price,
                    discount_percent: discount?.percent || 0,
                    price_before_disc: item.product.price,
                    invoice_no: 0, // Will be set by backend
                    txn_mode_code: txn_mode_code,
                    is_vat_exempt: item.isVatExempt || false,
                    price_before_less_vat: item.product.price,
                    is_scpwd_disc: item.isScpwdDiscount || false,
                    ordered_date: now.toLocaleDateString(),
                    ordered_time: now.toLocaleTimeString(),
                    disc_code_id: discountCodeId,
                    disc_description: discount?.name || 'Regular',
                    vatable_amt: item.vatableAmt || 0,
                    vat_amt: item.vatAmount || 0,
                    less_vat: item.lessVat || 0,
                    vat_exempt_amt: item.vatExemptAmt || 0,
                    zero_rated_amt: item.zeroRatedAmt || 0,
                    disc_amt: item.discountAmount || 0,
                    charge_amt: 0,
                    total_portion_qty: item.totalPortion || 0,
                    disc_portion_qty: item.discountQty || 0,
                    business_date: transaction.timestamp.toLocaleDateString(),
                    category_code: item.product.categoryCode || 'UNC',
                };
            });


            const transactionData = {
                company_code: companyCode,
                store_code: storeCode,
                terminal_id: terminalId,
                cashier_user_code: parseInt(transaction.cashierUserCode),
                total: transaction.total,
                payment_method: transaction.paymentMethod,
                change_given: transaction.change,
                transaction_date: transaction.timestamp.toLocaleDateString(),
                transaction_time: transaction.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                txn_mode_code: txn_mode_code,
                business_date: transaction.timestamp.toLocaleDateString(),
                cash_amount_paid: cashAmountPaid,
                encoded_by_user_code: parseInt(encodedByUserCode),
                printed_by_user_code: parseInt(printedByUserCode),
                items: items,
            };

            const result = await createTransactionData(transactionData);

            const newTransaction: Transaction = {
            ...transaction,
            id: result.id,
            };
            setTransactions((prev) => [newTransaction, ...prev]);
            return newTransaction;
        } catch (error) {
            console.error('Error creating transaction:', error);
            // Fallback to local state if backend fails
            const newTransaction: Transaction = {
            ...transaction,
            id: `tx${Date.now()}`,
            };
            setTransactions((prev) => [newTransaction, ...prev]);
            return newTransaction;
        }
        },
        []
    );
        
    const value: POSContextType = {
        currentUser,
        login,
        logout: () => setCurrentUser(null),
        cart,
        products,
        categories,
        discountCodes,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateDiscountQty,
        setItemDiscountCode,
        setItemPortioningDiscount,
        setItemDiscountMode,
        setItemTotalPortion,
        setItemRegularPortionDiscount,
        getCartTotal,
        calculateDiscount,
        calculateItemVATBreakdown,
        calculateTransactionVATSummary,
        clearCart,
        transactions,
        createTransaction
    };

    
    return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
}


export function usePOS() {
    const context = useContext(POSContext);
    if (!context) {
        throw new Error("usePOS must be used within a POSProvider");
    }
    return context;
}