'use client';

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Receipt, BarChart3, Package, Users, Settings, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePOS } from "@/lib/context";
import { ManagerLayout } from "@/components/layout/manager-layout";
import { Button } from "@/components/ui/button";
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { useState } from 'react';
import { PinConfirmationDialog } from "@/components/pos/pin-confirmation-dialog";

export default function ManagerDashboardPage() {
    const router = useRouter();
    const { managerAuth } = usePOS();
    const [pinDialogOpen, setPinDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDayEnd = async () => {
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

            await invoke('perform_day_end');
            toast.success('Day-end completed successfully. All transactions moved to history.');
            setPinDialogOpen(false);
        } catch (error) {
            toast.error('Failed to perform day-end: ' + error);
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
        }
    ];

    return (
        <ManagerLayout>
            <div className="flex flex-col h-full gap-6">
                
                {/* Day End Button */}
                <div className="flex justify-end">
                    <Button onClick={handleDayEnd} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                        <Moon className="w-4 h-4 mr-2" />
                        {loading ? 'Processing...' : 'Perform Day End'}
                    </Button>
                </div>

                {/* Module Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((module) => {
                        const Icon = module.icon;
                        return (
                            <Card
                                key={module.path}
                                className="cursor-pointer hover:shadow-lg ctive:shadow-md transition-shadow touch-target"
                                onClick={() => router.push(module.path)}
                            >
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-4`}>
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
        </ManagerLayout>
    );
}
