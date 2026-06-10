'use client';

import { useState, useEffect } from 'react';
import { ManagerLayout } from "@/components/layout/manager-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePOS } from '@/lib/context';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import BundleTab from './BundleTab';
import AddonsTab from './AddonsTab';

export default function ProductsPage() {
    const { products, categories, ingredients, units, conversions, loadInventoryData } = usePOS();
    const [activeTab, setActiveTab] = useState('products');

    useEffect(() => {
        loadInventoryData();
    }, [loadInventoryData]);

    return (
        <ManagerLayout>
            <div className="flex flex-col h-full">
                <h1 className="text-2xl font-bold mb-4">Products Management</h1>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                        <TabsTrigger value="bundles">Bundles</TabsTrigger>
                        <TabsTrigger value="add-ons">Add-ons</TabsTrigger>
                    </TabsList>

                    <TabsContent value="products" className="mt-4">
                        <ProductsTab products={products} categories={categories} ingredients={ingredients} units={units} conversions={conversions} loadInventoryData={loadInventoryData} />
                    </TabsContent>

                    <TabsContent value="categories" className="mt-4">
                        <CategoriesTab categories={categories} loadInventoryData={loadInventoryData} />
                    </TabsContent>

                    <TabsContent value="bundles" className="mt-4">
                        <BundleTab products={products} loadInventoryData={loadInventoryData} />
                    </TabsContent>

                    <TabsContent value="add-ons" className="mt-4">
                        <AddonsTab products={products} loadInventoryData={loadInventoryData} />
                    </TabsContent>
                </Tabs>
            </div>
        </ManagerLayout>
    );
}