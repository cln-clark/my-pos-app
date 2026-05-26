'use client';

import React, { createContext, useContext, useState, useCallback, useEffect  } from "react";
import { User, Product, CartItem, Transaction, Category, TransactionItem } from './types';
import { getProducts, getCategories, getDiscountCodes, createTransaction as createTransactionData, loginUser as loginUserApi } from "./data";
import { invoke } from '@tauri-apps/api/core';

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
    removeFromCart: (productId: string) => void;
    getCartTotal: () => number;
    calculateDiscount: (cart: CartItem[]) => number;
    calculateItemVATBreakdown: (cartItem: CartItem) => TransactionItem;
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
            return [ ...prev, { product, quantity, discountQty: 0, discountCodeId: undefined} ]
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
                { ...item, discountCodeId, discountQty: discountCodeId ? item.quantity : 0 }
                : item
        ))
    }, [])

    const calculateItemVATBreakdown = useCallback((cartItem: CartItem): TransactionItem => {
        const discount = cartItem.discountCodeId ? discountCodes.find(d => d.id === cartItem.discountCodeId) : null;
        const itemPrice = cartItem.product.price;
        const quantity = cartItem.quantity;
        const discountQty = cartItem.discountQty;

        // Calculate eligible amount for discount
        const eligibleAmount = itemPrice * discountQty;
        const nonDiscountedAmount = itemPrice * (quantity - discountQty);

        // Calculate discount amount
        let discountAmount = 0;
        let isVatExempt = false;

        if (discount && discountQty > 0) {
            if (discount.name === 'Senior Citizen' || discount.name === 'PWD' || discount.name === 'Athlete') {
                // VAT-exempt discount: (Eligible Amount / 1.12) * 0.20
                discountAmount = (eligibleAmount / 1.12) * 0.20;
                isVatExempt = true;
            } else {
                // Regular discount: Eligible Amount * (Discount % / 100)
                discountAmount = eligibleAmount * (discount.percent / 100);
            }
        }

        // VAT calculations
        const vatableAmt = isVatExempt ? nonDiscountedAmount : (itemPrice * quantity);
        const vatAmount12Pct = vatableAmt * 0.12;
        const lessVat12Pct = isVatExempt ? (eligibleAmount / 1.12) * 0.12 : 0;
        const vatExemptAmt = isVatExempt ? (eligibleAmount / 1.12) : 0;

        // Discount percentage
        const srAndOthersDiscPercent = (discount && isVatExempt) ? 20 : (discount ? discount.percent : 0);

        return {
            product: cartItem.product,
            quantity: cartItem.quantity,
            discountQty: cartItem.discountQty,
            discountCodeId: cartItem.discountCodeId,
            vatableAmt: Math.round(vatableAmt * 100000) / 100000,
            vatAmount12Pct: Math.round(vatAmount12Pct * 100000) / 100000,
            lessVat12Pct: Math.round(lessVat12Pct * 100000) / 100000,
            vatExemptAmt: Math.round(vatExemptAmt * 100000) / 100000,
            discountAmount: Math.round(discountAmount * 100000) / 100000,
            chargeAmount: 0,
            totalPortionQty: quantity,
            discountPortionQty: discountQty,
            srAndOthersDiscPercent: Math.round(srAndOthersDiscPercent * 100000) / 100000,
            discountCode: cartItem.discountCodeId || 0,
            discountDescription: discount?.name || 'No Discount',
        };
    }, [discountCodes])

    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    }, [cart])

    const calculateDiscount = useCallback((cart: CartItem[]) => {
        let totalDiscount = 0;
        for (const item of cart) {
            if (item.discountCodeId && item.discountQty > 0) {
                const discount = discountCodes.find(d => d.id === item.discountCodeId);
                if (!discount) continue;

                const itemPrice = item.product.price;
                const eligibleAmount = itemPrice * item.discountQty;

                // Senior/PWD/Athlete discount: (Eligible Amount / 1.12) * 0.20
                if (discount.name === 'Senior Citizen' || discount.name === 'PWD' || discount.name === 'Athlete') {
                    totalDiscount += (eligibleAmount / 1.12) * 0.20;
                }
                // Regular discount: Eligible Amount * (Discount % / 100)
                else {
                    totalDiscount += eligibleAmount * (discount.percent / 100);
                }
            }
        }

        return totalDiscount;
    }, [discountCodes])

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const createTransaction = useCallback(
        async (transaction: Omit<Transaction, 'id'>) => {
            const companyCode = 1;
            const storeCode = 1;
            const terminalId = 3;
            const encodedByUserCode = transaction.cashierUserCode;
            const printedByUserCode = transaction.cashierUserCode;
            const cashAmountPaid = transaction.paymentMethod === 'cash' ? (transaction.total + (transaction.change || 0)) : null;
        try {
            // Map txn_mode to code: dine-in = 1, takeout = 2
            const txn_mode_code = transaction.txnMode === 'takeout' ? 2 : 1;

            const items = transaction.items.map((item: any, index: number) => {
                const now = new Date();
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
                    txn_mode_code: txn_mode_code,
                    ordered_date: now.toLocaleDateString(),
                    ordered_time: now.toLocaleTimeString(),
                    discount_code_id: transaction.discountCodeId || null,
                    discount_qty: item.discountQty || 0,
                    business_date: transaction.timestamp.toLocaleDateString(),
                    category_code: item.product.categoryCode || 'UNC',
                    // VAT breakdown fields
                    SrAndOthersDiscPercent: item.srAndOthersDiscPercent || 0,
                    DiscountCode: item.discountCode || 0,
                    DiscountDescription: item.discountDescription || '',
                    VATableAmt: item.vatableAmt || 0,
                    VATAmount_12Pct: item.vatAmount12Pct || 0,
                    LessVAT_12Pct: item.lessVat12Pct || 0,
                    VATExemptAmt: item.vatExemptAmt || 0,
                    DiscountAmount: item.discountAmount || 0,
                    ChargeAmount: item.chargeAmount || 0,
                    TotalPortionQty: item.totalPortionQty || 0,
                    DiscountPortionQty: item.discountPortionQty || 0,
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
        getCartTotal,
        calculateDiscount,
        calculateItemVATBreakdown,
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