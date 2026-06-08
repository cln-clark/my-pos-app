'use client';

import { useState, useEffect } from 'react';
import { ManagerLayout } from "@/components/layout/manager-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePOS } from '@/lib/context';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import IngredientsTab from './IngredientsTab';

export default function InventoryPage() {
    const { units, ingredients, conversions, products, categories, loadInventoryData, loadProductRecipe, productRecipes } = usePOS();
    const [activeTab, setActiveTab] = useState('products');

    useEffect(() => {
        loadInventoryData();
    }, [loadInventoryData]);

    return (
        <ManagerLayout>
            <div className="flex flex-col h-full">
                <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                        <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                    </TabsList>

                    <TabsContent value="products" className="mt-4">
                        <ProductsTab products={products} categories={categories} ingredients={ingredients} units={units} conversions={conversions} loadInventoryData={loadInventoryData} loadProductRecipe={loadProductRecipe} productRecipes={productRecipes} />
                    </TabsContent>

                    <TabsContent value="categories" className="mt-4">
                        <CategoriesTab categories={categories} loadInventoryData={loadInventoryData} />
                    </TabsContent>

                    <TabsContent value="ingredients" className="mt-4">
                        <IngredientsTab ingredients={ingredients} units={units} loadInventoryData={loadInventoryData} />
                    </TabsContent>
                </Tabs>
            </div>
        </ManagerLayout>
    );
}
