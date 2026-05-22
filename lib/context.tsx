'use client';

import React, { createContext, useContext, useState, useCallback, useEffect  } from "react";
import { User, Product, CartItem, Transaction, Category } from './types';
import { getProducts, getCategories } from "./data";
import { invoke } from '@tauri-apps/api/core';

interface POSContextType {
    currentUser: User | null;
    login: (userid: number, pin: string) => Promise<boolean>;
    logout: () => void;

    products: Product[];
    categories: Category[];
    cart: CartItem[];
    addToCart: (product: Product, quantity: number) => void;
    updateCartQuantity: (productId: string, quantity: number) =>  void;
    removeFromCart: (productId: string) => void;
    getCartTotal: () => number;
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
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        getProducts().then((data) => {
            if (data.length > 0) {
                setProducts(data);
            }
        });
        getCategories().then((data) => {
            if (data.length > 0) {
                setCategories(data);
            }
        });
    }, []);

    const login = useCallback(async (cashierUserCode: number, pin: string): Promise<boolean> => {
        try {
            const user = await invoke('login_user', { cashierUserCode, pin });
            if (user) {
                const roles = await invoke('get_roles');
                const foundRole = (roles as any[]).find((r: any) => r.id === (user as any).role_id);
                const userWithRole = {
                    ...(user as any),
                    id: (user as any).id.toString(),
                    role: foundRole ? {
                        id: foundRole.id,
                        name: foundRole.role_name
                    } : null
                };
                setCurrentUser(userWithRole as User);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
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
            return [ ...prev, { product, quantity} ]
        })
    }, []);
 
    
    const removeFromCart = useCallback((productId: string) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId))
    }, []);

    const updateCartQuantity = useCallback((productId: string, quantity: number) => {
        if(quantity <=0 ){
            removeFromCart(productId)
        } 
        else {
            setCart((prev) => prev.map((item) => 
                item.product.id === productId ?
                    { ...item, quantity }
                    : item
            ))
        }
    }, [removeFromCart])

    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    }, [cart])

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
            const items = transaction.items.map((item: any) => {
                const category = categories.find(c => c.id === item.product.categoryId);
                return {
                    company_code: companyCode,
                    store_code: storeCode,
                    terminal_id: terminalId,
                    product_id: item.product.id,
                    qty: item.quantity,
                    price: item.product.price,
                    subtotal: item.product.price * item.quantity,
                    business_date: transaction.timestamp.toLocaleDateString(),
                    category_code: category?.categoryCode || 'UNC',
                };
            });

            // Map txn_mode to code: dine-in = 1, takeout = 2
            const txn_mode_code = transaction.txnMode === 'takeout' ? 2 : 1;

            
            const result = await invoke('create_transaction', {
            transactionData: {
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
            }
            });

            const newTransaction: Transaction = {
            ...transaction,
            id: (result as any).id.toString(),
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
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getCartTotal,
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