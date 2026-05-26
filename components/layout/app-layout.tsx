'use client';

import { usePOS } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useEffect, useRef } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {

    const { currentUser, logout } = usePOS();
    const router = useRouter();
    const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
    const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    if (!currentUser) {
        return <>{children}</>;
    }

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const resetInactivityTimer = () => {
        if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current);
        }
        inactivityTimer.current = setTimeout(() => {
            handleLogout();
        }, INACTIVITY_TIMEOUT);
    };

    useEffect(() => {
        // Set up inactivity timer
        resetInactivityTimer();

        // Reset timer on user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        const handleActivity = () => resetInactivityTimer();

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Kiosk Header */}
            <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold">POS Kiosk</h1>
                    <p className="text-sm text-slate-400">Cashier: {currentUser.name}</p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="h-12 px-6 text-black font-bold border-slate-600 hover:text-white hover:bg-slate-800 active:scale-95 transition-transform"
                >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span className="text-base">Logout</span>
                </Button>
            </header>
            <main className="flex-1 h-full p-6 overflow-auto">
                {children}
            </main>
        </div>
    );

}