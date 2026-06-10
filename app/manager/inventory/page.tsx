'use client';

import { useState, useEffect } from 'react';
import { ManagerLayout } from "@/components/layout/manager-layout";
import { usePOS } from '@/lib/context';
import IngredientsTab from './IngredientsTab';

export default function InventoryPage() {
    const { units, ingredients, loadInventoryData } = usePOS();

    useEffect(() => {
        loadInventoryData();
    }, [loadInventoryData]);

    return (
        <ManagerLayout>
            <div className="flex flex-col h-full">
                <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
                <div className="flex-1">
                    <IngredientsTab ingredients={ingredients} units={units} loadInventoryData={loadInventoryData} />
                </div>
            </div>
        </ManagerLayout>
    );
}
