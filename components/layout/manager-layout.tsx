'use client';

import { usePOS } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ManagerLayout({ children }: { children: React.ReactNode }) {
    const { managerAuth, setManagerAuth } = usePOS();
    const router = useRouter();
    const pathname = usePathname();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [exitDialogOpen, setExitDialogOpen] = useState(false);

    const handleBack = () => {
        router.push('/manager');
    };

    const handleExitToCashier = () => {
        setExitDialogOpen(true);
    };

    const confirmExitToCashier = () => {
        setManagerAuth(null);
        setExitDialogOpen(false);
        router.push('/cashier');
    };

    const getPageTitle = () => {
        const path = pathname.replace('/manager/', '');
        const segments = path.split('/').filter(Boolean);

        if (segments.length === 0) {
            return 'Manager Dashboard';
        }

        return segments[0]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!managerAuth) {
            router.push('/cashier');
        }
    }, [managerAuth, router]);

    if (!managerAuth) {
        return null;
    }

    const pageTitle = getPageTitle();
    const showBackButton = pathname !== '/manager';

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Kiosk Header */}
            <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    {showBackButton && (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="h-12 px-4 text-slate-900 touch-target font-medium"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Back
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold">POS {pageTitle}</h1>
                        <p className="text-sm text-slate-400">Manager: {managerAuth.name} | Terminal No. 1</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
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
                        onClick={handleExitToCashier}
                        className="h-12 px-6 text-slate-900 touch-target font-medium"
                    >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Exit to Cashier
                    </Button>
                </div>
            </header>
            <main className="flex-1 h-full p-6 overflow-auto">
                {children}
            </main>
            <Toaster />
            
            <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Exit to Cashier</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to exit to cashier mode? Your manager session will be ended.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExitDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmExitToCashier}>
                            Exit to Cashier
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
