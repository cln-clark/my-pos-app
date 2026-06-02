'use client';

import { ManagerLayout } from "@/components/layout/manager-layout";

export default function UsersPage() {
    return (
        <ManagerLayout>
            <div className="flex flex-col h-full">
                <h1 className="text-2xl font-bold mb-4">User Management</h1>
                <p className="text-muted-foreground">This module is under development.</p>
            </div>
        </ManagerLayout>
    );
}
