'use client';

import React, { createContext, useContext, useState, useCallback  } from "react";
import { User, Product, CartItem, Transaction } from './types';
import { MOCK_USERS } from "./data";

interface POSContextType {
    currentUser: User | null;
    login: (userid: string, pin: string) => boolean;
    logout: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);

    const login = useCallback((userId: string, pin: string): boolean => {
        const user = MOCK_USERS.find((u) => u.id === userId && u.pin === pin);
                
        if(user) {
            setCurrentUser(user);
            return true
        }
    return false;    

    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        setCart([]);
    }, []);

    const value: POSContextType = {
        currentUser,
        login,
        logout: () => setCurrentUser(null),
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