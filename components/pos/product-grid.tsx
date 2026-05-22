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
        const cats = ['All', ...new Set(products.map(p => p.category))]
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
        <div className="flex flex-col h-full gap-4">
            {/* Search and Filter - Fixed at top */}
            <div className="space-y-3 shrink-0">
                <Input placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10"
                />
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((category) => (
                        <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="whitespace-nowrap"
                        >
                        {category}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Product Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {   filteredProducts.map((product) => (
                        <Card   key={product.id}
                                onClick={(e) => { addToCart(product, 1)}}
                                className={`border border-slate-250 p-3 cursor-pointer transition-all hover:shadow-lg flex flex-col ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                {/* Product Image */}
                                <div className="w-full aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg mb-3 flex items-center justify-center">
                                    <span className="text-4xl">📦</span>
                                </div>

                                {/* Product Info */}
                                <div className="text-center flex flex-col flex-1">
                                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                                    <p className="text-xs text-gray-500">{product.sku}</p>
                                    <p className="text-lg font-bold text-green-600 mt-auto">₱{product.price.toFixed(2)}</p>
                                </div>

                                {/* Stock Status */}
                                <p className={`text-xs ${
                                    product.stock < 10
                                    ? 'text-red-600 font-semibold'
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