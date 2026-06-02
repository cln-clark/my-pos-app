'use client';

import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useState, useMemo } from "react";
import { usePOS } from "@/lib/context";

export function ProductGrid() {

    const { products, addToCart } = usePOS();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
      
    const categories = useMemo(() => {
        const cats = ['All', ...new Set(products.map(p => p.category || 'Uncategorized'))]
        return cats
    }, [products])

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }, [products, searchQuery, selectedCategory])
    
    return(
        <div className="flex flex-col h-full gap-3">
            {/* Search and Filter - Fixed at top */}
            <div className="space-y-3 shrink-0">
                <Input placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 text-base"
                />
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((category) => (
                        <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="default"
                        onClick={() => setSelectedCategory(category)}
                        className="whitespace-nowrap h-10 active:scale-95 transition-transform"
                        >
                        {category}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Product Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {   filteredProducts.map((product) => (
                        <Card   key={`${product.id}-${product.sku}`}
                                onClick={(e) => { if (product.stock > 0) addToCart(product, 1)}}
                                className={`border border-slate-200 p-3 cursor-pointer transition-all active:scale-95 flex flex-col ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'active:border-blue-500'}`}
                                >
                                {/* Product Info */}
                                <div className="text-center flex flex-col flex-1">
                                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h3>
                                    <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                                    <p className="text-lg font-bold text-green-600 mt-auto">₱{product.price.toFixed(2)}</p>
                                </div>

                                {/* Stock Status */}
                                <p className={`text-xs font-medium mt-2 ${
                                    product.stock < 10
                                    ? 'text-red-600'
                                    : 'text-muted-foreground'
                                }`}>
                                    {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of stock'}
                                </p>
                        </Card>
                        ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                    <p className="text-muted-foreground">No products found</p>
                    </div>
                )}
            </div>
        </div>
    )
}