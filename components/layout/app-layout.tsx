'use client';

import { usePOS } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ManagerAuthModal } from "@/components/pos/manager-auth-modal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { invoke } from '@tauri-apps/api/core';

export function AppLayout({ children }: { children: React.ReactNode }) {

    const { currentUser, logout, setManagerAuth } = usePOS();
    const router = useRouter();
    const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
    const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    const [currentTime, setCurrentTime] = useState(new Date());
    const [managerAuthOpen, setManagerAuthOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [managerAuthError, setManagerAuthError] = useState('');

    const handleLogout = () => {
        setLogoutDialogOpen(true);
    };

    const confirmLogout = () => {
        logout();
        setLogoutDialogOpen(false);
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

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!currentUser) {
            router.push('/');
        }
    }, [currentUser, router]);

    if (!currentUser) {
        return null;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Kiosk Header */}
            <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold">POS</h1>
                    <p className="text-sm text-slate-400">Cashier: {currentUser.name} | Terminal No. 1</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-sm text-slate-300">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-lg font-mono font-semibold">
                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setManagerAuthOpen(true)}
                        className="h-12 px-6 text-black font-bold border-slate-600"
                    >
                        <span className="text-base">Manager/Supervisor Override</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="h-12 px-6 text-black font-bold border-slate-600"
                    >
                        <LogOut className="h-5 w-5 mr-2" />
                        <span className="text-base">Logout</span>
                    </Button>
                </div>
            </header>
            <main className="flex-1 h-full p-6 overflow-auto">
                {children}
            </main>
            <Toaster />
            
            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Logout</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to logout? This will end your session and return to the login screen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmLogout}>
                            Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <ManagerAuthModal
                open={managerAuthOpen}
                onOpenChange={(open) => {
                    setManagerAuthOpen(open);
                    if (!open) setManagerAuthError('');
                }}
                onAuthSuccess={async (managerPin) => {
                    try {
                        // Authenticate manager - assuming manager user ID is 2
                        // You may need to adjust this based on your actual manager user ID
                        const user = await invoke<any>('login_user', {
                            cashierUserCode: 2, // Manager user ID
                            pin: managerPin,
                        });

                        // Verify it's actually a manager (role_id = 2)
                        if (user.role_id !== 2) {
                            setManagerAuthError('User is not a manager');
                            return;
                        }

                        setManagerAuth({
                            id: user.id.toString(),
                            name: user.name,
                            email: user.email,
                            role: { id: user.role_id, name: 'Manager' },
                            pin: user.pin,
                        });

                        setManagerAuthError('');
                        setManagerAuthOpen(false);
                        router.push('/manager');
                    } catch (error) {
                        setManagerAuthError('Manager authentication failed: ' + error);
                    }
                }}
                error={managerAuthError}
            />
        </div>
    );

}