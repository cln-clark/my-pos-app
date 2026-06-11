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
                <h1 className="text-xl font-semibold">Products Management</h1>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="grid w-full grid-cols-4 p-0">
                        <TabsTrigger className='text-sm' value="products">Products</TabsTrigger>
                        <TabsTrigger className='text-sm' value="categories">Categories</TabsTrigger>
                        <TabsTrigger className='text-sm' value="bundles">Bundles</TabsTrigger>
                        <TabsTrigger className='text-sm' value="add-ons">Add-ons</TabsTrigger>
                    </TabsList>

                    <TabsContent value="products" className="">
                        <ProductsTab products={products} categories={categories} ingredients={ingredients} units={units} conversions={conversions} loadInventoryData={loadInventoryData} />
                    </TabsContent>

                    <TabsContent value="categories" className="">
                        <CategoriesTab categories={categories} loadInventoryData={loadInventoryData} />
                    </TabsContent>

                    <TabsContent value="bundles" className="">
                        <BundleTab products={products} loadInventoryData={loadInventoryData} />
                    </TabsContent>

                    <TabsContent value="add-ons" className="">
                        <AddonsTab products={products} loadInventoryData={loadInventoryData} />
                    </TabsContent>
                </Tabs>
            </div>
        </ManagerLayout>
    );
}