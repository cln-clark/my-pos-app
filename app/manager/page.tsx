'use client';

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Receipt, BarChart3, Package, Users, Settings, Moon, Sun, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePOS } from "@/lib/context";
import { ManagerLayout } from "@/components/layout/manager-layout";
import { Button } from "@/components/ui/button";
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { PinConfirmationDialog } from "@/components/pos/pin-confirmation-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ManagerDashboardPage() {
    const router = useRouter();
    const { managerAuth } = usePOS();
    const [pinDialogOpen, setPinDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [businessDayOpen, setBusinessDayOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'day-start' | 'day-end' | null>(null);

    useEffect(() => {
        fetchBusinessDayStatus();
    }, []);

    const fetchBusinessDayStatus = async () => {
        try {
            const isOpen = await invoke<boolean>('get_business_day_status');
            console.log('Business day status:', isOpen);
            setBusinessDayOpen(isOpen);
        } catch (error) {
            console.error('Failed to fetch business day status:', error);
        }
    };

    const handleDayStart = () => {
        setPendingAction('day-start');
        setConfirmDialogOpen(true);
    };

    const handleDayEnd = () => {
        setPendingAction('day-end');
        setConfirmDialogOpen(true);
    };

    const handleConfirmAction = () => {
        setConfirmDialogOpen(false);
        setPinDialogOpen(true);
    };

    const handlePinConfirm = async (pin: string) => {
        setLoading(true);
        try {
            // Validate PIN (assuming role_id 2 is manager)
            const users = await invoke<any[]>('get_users');
            const manager = users.find((u: any) => u.role_id === 2 && u.pin === pin);

            if (!manager) {
                toast.error('Invalid manager PIN');
                return;
            }

            if (pendingAction === 'day-start') {
                await invoke('perform_day_start');
                toast.success('Day-start completed successfully.');
                await fetchBusinessDayStatus(); // Refresh status from backend
                router.push('/login?dayStart=true');
            } else if (pendingAction === 'day-end') {
                await invoke('perform_day_end');
                toast.success('Day-end completed successfully. All transactions moved to history.');
                setBusinessDayOpen(false);
                await fetchBusinessDayStatus();
            }

            setPinDialogOpen(false);
            setPendingAction(null);
        } catch (error) {
            toast.error(`Failed to perform ${pendingAction}: ` + error);
        } finally {
            setLoading(false);
        }
    };

    const modules = [
        {
            title: "Void / Exchange",
            description: "Process voids and exchanges",
            icon: Receipt,
            path: "/manager/void-exchange",
            color: "bg-red-500"
        },
        {
            title: "Reports",
            description: "View sales and performance reports",
            icon: BarChart3,
            path: "/manager/reports",
            color: "bg-green-500"
        },
        {
            title: "Inventory Management",
            description: "Manage products and stock",
            icon: Package,
            path: "/manager/inventory",
            color: "bg-purple-500"
        },
        {
            title: "User Management",
            description: "Manage users and roles",
            icon: Users,
            path: "/manager/users",
            color: "bg-orange-500"
        },
        {
            title: "Dev Settings",
            description: "Manage system settings",
            icon: Settings,
            path: "/manager/dev-settings",
            color: "bg-gray-500"
        },
        {
            title: "Perform Day Start",
            description: "Complete start-of-day operations",
            icon: Sun,
            action: handleDayStart,
            color: "bg-yellow-500",
            disabled: businessDayOpen
        },
        {
            title: "Perform Day End",
            description: "Complete end-of-day operations",
            icon: Moon,
            action: handleDayEnd,
            color: "bg-indigo-500",
            disabled: !businessDayOpen
        }
    ];

    return (
        <ManagerLayout>
            <div className="flex flex-col h-full gap-6">
                {/* Module Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
                    {modules.map((module) => {
                        const Icon = module.icon;
                        return (
                            <Card
                                key={module.path || module.title}
                                className={`cursor-pointer hover:shadow-lg active:shadow-md transition-shadow touch-target ${module.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !module.disabled && (module.action ? module.action() : router.push(module.path!))}
                            >
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-4 ${module.disabled ? 'opacity-50' : ''}`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-xl">{module.title}</CardTitle>
                                    <CardDescription>{module.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <PinConfirmationDialog
                open={pinDialogOpen}
                onOpenChange={setPinDialogOpen}
                onConfirm={handlePinConfirm}
            />

            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {pendingAction === 'day-start' ? 'Start Business Day' : 'End Business Day'}
                        </DialogTitle>
                        <DialogDescription>
                            {pendingAction === 'day-start'
                                ? 'Are you sure you want to start a new business day? This will enable transaction processing.'
                                : 'Are you sure you want to end the business day? This will move all transactions to history and disable transaction processing.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmAction}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ManagerLayout>
    );
}
