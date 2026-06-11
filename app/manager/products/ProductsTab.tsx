'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Plus, Trash2 } from 'lucide-react';
import { CreateProductRequest, UpdateProductRequest, CsvProductRow, ProductVariationResponse, CreateVariationRequest, UpdateVariationRequest, CreateRecipeRequest, UpdateRecipeRequest } from '@/lib/types';
import { createProduct, updateProduct, deleteProduct, batchImportProducts, getProductVariations, createVariation, updateVariation, deleteVariation, getProductRecipe, createRecipe, updateRecipe, deleteRecipe } from '@/lib/data';
import { toast } from 'sonner';
import { Separator } from "@/components/ui/separator";

interface ProductsTabProps {
    products: any[];
    categories: any[];
    ingredients: any[];
    units: any[];
    conversions: any[];
    loadInventoryData: () => Promise<void>;
}

export default function ProductsTab({ products, categories, ingredients, units, conversions, loadInventoryData }: ProductsTabProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        price: 0,
        category_id: undefined as number | undefined,
    });
    const [variations, setVariations] = useState<ProductVariationResponse[]>([]);
    const [originalVariations, setOriginalVariations] = useState<ProductVariationResponse[]>([]);
    const [syncWithInventory, setSyncWithInventory] = useState(false);
    const [productIngredients, setProductIngredients] = useState<Record<string, Array<{ ingredientId: number | undefined; uom: string; costPerUnit: number; quantity: number | undefined; totalCost: number; recipeId?: number }>>>({});
    const [originalIngredients, setOriginalIngredients] = useState<Record<string, Array<{ ingredientId: number | undefined; uom: string; costPerUnit: number; quantity: number | undefined; totalCost: number; recipeId?: number }>>>({});
    const [newIngredient, setNewIngredient] = useState({ ingredientId: undefined, uom: '', costPerUnit: 0, quantity: undefined });
    const [activeVariationTab, setActiveVariationTab] = useState<string>('base');

    const toTitleCase = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const handleAddProduct = async () => {
        setIsAdding(true);
        setEditingProduct(null);
        setFormData({ sku: '', name: '', price: 0, category_id: undefined });
        setVariations([]);
        setOriginalVariations([]);
        setSyncWithInventory(false);
        setProductIngredients({});
        setOriginalIngredients({});
        setNewIngredient({ ingredientId: undefined, uom: '', costPerUnit: 0, quantity: undefined });
        setActiveVariationTab('base');
        setIsDialogOpen(true);
    };

    const handleAddIngredient = () => {
        const newBlankIngredient = {
            ingredientId: undefined,
            uom: '',
            costPerUnit: 0,
            quantity: undefined,
            totalCost: 0,
        };
        setProductIngredients({
            ...productIngredients,
            [activeVariationTab]: [...(productIngredients[activeVariationTab] || []), newBlankIngredient]
        });
    };

    const handleRemoveIngredient = (index: number) => {
        setProductIngredients({
            ...productIngredients,
            [activeVariationTab]: (productIngredients[activeVariationTab] || []).filter((_, i) => i !== index)
        });
    };

    // Diffing helper for variations
    const diffVariations = (current: ProductVariationResponse[], original: ProductVariationResponse[]) => {
        const newVariations = current.filter(v => !v.id || v.id < 0); // Temporary IDs (Date.now())
        const updatedVariations = current.filter(v => original.find(o => o.id === v.id && (o.name !== v.name || o.price !== v.price)));
        const deletedVariations = original.filter(o => !current.find(c => c.id === o.id));
        return { newVariations, updatedVariations, deletedVariations };
    };

    // Diffing helper for ingredients
    const diffIngredients = (current: Array<{ ingredientId: number | undefined; uom: string; costPerUnit: number; quantity: number | undefined; totalCost: number; recipeId?: number }>, original: Array<{ ingredientId: number | undefined; uom: string; costPerUnit: number; quantity: number | undefined; totalCost: number; recipeId?: number }>) => {
        const newIngredients = current.filter(ing => !ing.recipeId);
        const updatedIngredients = current.filter(ing => {
            const orig = original.find(o => o.recipeId === ing.recipeId);
            return orig && (orig.ingredientId !== ing.ingredientId || orig.uom !== ing.uom || orig.quantity !== ing.quantity);
        });
        const deletedIngredients = original.filter(orig => !current.find(cur => cur.recipeId === orig.recipeId));
        return { newIngredients, updatedIngredients, deletedIngredients };
    };

    const handleSaveProduct = async () => {
        if (!formData.sku || !formData.name || formData.price <= 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            let productId: number;

            if (editingProduct) {
                const data: UpdateProductRequest = {
                    id: parseInt(editingProduct.id),
                    sku: formData.sku,
                    name: formData.name,
                    price: formData.price,
                    category_id: formData.category_id,
                };
                await updateProduct(data);
                productId = parseInt(editingProduct.id);
                toast.success('Product updated successfully');
            } else {
                const data: CreateProductRequest = {
                    sku: formData.sku,
                    name: formData.name,
                    price: formData.price,
                    category_id: formData.category_id,
                };
                const result = await createProduct(data);
                productId = result.id;
                toast.success('Product added successfully');
            }

            // Save variations with diffing
            if (editingProduct) {
                const { newVariations, updatedVariations, deletedVariations } = diffVariations(variations, originalVariations);
                
                // Create new variations
                for (const variation of newVariations) {
                    const variationData: CreateVariationRequest = {
                        product_id: productId,
                        name: variation.name,
                        price: variation.price,
                    };
                    await createVariation(variationData);
                }
                
                // Update existing variations
                for (const variation of updatedVariations) {
                    const variationData: UpdateVariationRequest = {
                        id: variation.id,
                        name: variation.name,
                        price: variation.price,
                        is_active: variation.is_active,
                    };
                    await updateVariation(variationData);
                }

                // Delete removed variations
                for (const variation of deletedVariations) {
                    await deleteVariation(variation.id);
                    // Delete recipes for this variation
                    const variationRecipes = await getProductRecipe(productId);
                    const recipesToDelete = variationRecipes.filter(r => r.variation_id === variation.id);
                    for (const recipe of recipesToDelete) {
                        await deleteRecipe(recipe.id);
                    }
                }
            } else if (variations.length > 0) {
                // For new products, just create all variations
                for (const variation of variations) {
                    const variationData: CreateVariationRequest = {
                        product_id: productId,
                        name: variation.name,
                        price: variation.price,
                    };
                    await createVariation(variationData);
                }
            }

            // Save ingredients with diffing per variation
            if (syncWithInventory) {
                // Iterate through each variation (including "base")
                for (const [variationKey, currentIngredients] of Object.entries(productIngredients)) {
                    const originalIngredientsForVariation = originalIngredients[variationKey] || [];
                    const { newIngredients, updatedIngredients, deletedIngredients } = diffIngredients(currentIngredients, originalIngredientsForVariation);

                    const variationId = variationKey === 'base' ? undefined : parseInt(variationKey);

                    // Create new ingredients
                    for (const ingredient of newIngredients) {
                        if (ingredient.ingredientId) {
                            const recipeData: CreateRecipeRequest = {
                                product_id: productId,
                                ingredient_id: ingredient.ingredientId,
                                usage_qty: ingredient.quantity || 0,
                                usage_uom_code: ingredient.uom,
                                variation_id: variationId,
                            };
                            await createRecipe(recipeData);
                        }
                    }

                    // Update existing ingredients
                    for (const ingredient of updatedIngredients) {
                        if (ingredient.recipeId && ingredient.ingredientId) {
                            const recipeData: UpdateRecipeRequest = {
                                id: ingredient.recipeId,
                                product_id: productId,
                                ingredient_id: ingredient.ingredientId,
                                usage_qty: ingredient.quantity || 0,
                                usage_uom_code: ingredient.uom,
                                variation_id: variationId,
                            };
                            await updateRecipe(recipeData);
                        }
                    }

                    // Delete removed ingredients
                    for (const ingredient of deletedIngredients) {
                        if (ingredient.recipeId) {
                            await deleteRecipe(ingredient.recipeId);
                        }
                    }
                }
            }

            setFormData({ sku: '', name: '', price: 0, category_id: undefined });
            setVariations([]);
            setOriginalVariations([]);
            setProductIngredients({});
            setOriginalIngredients({});
            setSyncWithInventory(false);
            setActiveVariationTab('base');
            setIsAdding(false);
            setEditingProduct(null);
            setIsDialogOpen(false);
            loadInventoryData();
        } catch (error) {
            toast.error(editingProduct ? 'Failed to update product' : 'Failed to add product');
            console.error(error);
        }
    };

    const handleEditProduct = async (product: any) => {
        setEditingProduct(product);
        setFormData({
            sku: product.sku,
            name: product.name,
            price: product.price,
            category_id: product.category_id,
        });

        // Load product variations
        const productVariations = await getProductVariations(parseInt(product.id));
        setVariations(productVariations);
        setOriginalVariations(productVariations);

        // Load product ingredients per variation
        const productRecipe = await getProductRecipe(parseInt(product.id));
        const ingredientsByVariation: Record<string, any[]> = {};
        const originalIngredientsByVariation: Record<string, any[]> = {};

        // Initialize base ingredients
        ingredientsByVariation['base'] = [];
        originalIngredientsByVariation['base'] = [];

        // Group ingredients by variation_id
        for (const recipe of productRecipe) {
            const variationKey = recipe.variation_id ? recipe.variation_id.toString() : 'base';
            const mappedIngredient = {
                ingredientId: recipe.ingredient_id,
                uom: recipe.usage_uom_code,
                costPerUnit: recipe.cost / recipe.usage_qty,
                quantity: recipe.usage_qty,
                totalCost: recipe.cost,
                recipeId: recipe.id
            };

            if (!ingredientsByVariation[variationKey]) {
                ingredientsByVariation[variationKey] = [];
                originalIngredientsByVariation[variationKey] = [];
            }

            ingredientsByVariation[variationKey].push(mappedIngredient);
            originalIngredientsByVariation[variationKey].push(mappedIngredient);
        }

        setProductIngredients(ingredientsByVariation);
        setOriginalIngredients(originalIngredientsByVariation);
        setSyncWithInventory(true);
        setActiveVariationTab('base');

        setIsDialogOpen(true);
    };

    const handleDeleteProduct = async (productId: number) => {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await deleteProduct(productId);
            toast.success('Product deleted successfully');
            loadInventoryData();
        } catch (error) {
            toast.error('Failed to delete product');
            console.error(error);
        }
    };

    const handleAddVariation = () => {
        const newVariationWithId = {
            id: Date.now(), // Temporary ID for local state
            product_id: editingProduct ? parseInt(editingProduct.id) : 0,
            name: '',
            price: 0,
            is_active: true,
        };
        setVariations([...variations, newVariationWithId]);
        // Initialize empty ingredients for new variation
        setProductIngredients({
            ...productIngredients,
            [newVariationWithId.id.toString()]: []
        });
        setOriginalIngredients({
            ...originalIngredients,
            [newVariationWithId.id.toString()]: []
        });
    };

    const handleCsvUploadProducts = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                toast.error('CSV file is empty or has no data rows');
                setIsUploading(false);
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const expectedHeaders = ['sku', 'name', 'price', 'category_code', 'category_name'];

            if (!expectedHeaders.every(h => headers.includes(h))) {
                toast.error('CSV must have columns: SKU, Name, Price, category_code, category_name');
                setIsUploading(false);
                return;
            }

            const products: CsvProductRow[] = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length < 4) continue;

                const price = values[2] ? parseFloat(values[2]) : 0;
                if (values[2] && isNaN(price)) {
                    toast.error(`Row ${i + 1}: Invalid price value`);
                    continue;
                }

                products.push({
                    sku: values[0],
                    name: values[1],
                    price: price,
                    category_code: values[3],
                    category_name: values[4] || '',
                });
            }

            if (products.length === 0) {
                toast.error('No valid products found in CSV');
                setIsUploading(false);
                return;
            }

            const result = await batchImportProducts({ products });

            if (result.error_count > 0) {
                toast.error(`Import completed with ${result.success_count} successes and ${result.error_count} errors`);
                result.errors.forEach(err => console.error(err));
            } else {
                toast.success(`Successfully imported ${result.success_count} products`);
            }

            loadInventoryData();
        } catch (error) {
            toast.error('Failed to process CSV file');
            console.error(error);
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    return (
        <Card className='rounded-md pt-4'>
            <CardHeader className='flex items-center justify-between'>
                <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Add products to your inventory</CardDescription>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleCsvUploadProducts}
                        disabled={isUploading}
                        className="hidden"
                        id="csv-upload"
                    />
                    <Button
                        onClick={() => document.getElementById('csv-upload')?.click()}
                        disabled={isUploading}
                        variant="outline"
                        className='rounded-md text-xs'
                    >
                        {isUploading ? 'Uploading...' : 'Upload CSV'}
                    </Button>
                    <Button onClick={handleAddProduct} 
                            className='rounded-md text-xs'
                            >
                        Add Product
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent showCloseButton={false} className="!w-[90vw] !max-w-[90vw] !h-[700px] !max-h-[700px] !pt-4 flex flex-col scrollbar-hide rounded-md gap-4 ">
                        <DialogHeader className='!pb-0 !p-0 !space-y-1'>
                            <DialogTitle className='!text-2xl font-extrabold'>{editingProduct ? 'Editing Product' : 'Adding Product'}</DialogTitle>
                        </DialogHeader>
                        <Separator></Separator>
                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto scrollbar-hide">
                            <div className="grid grid-cols-3 gap-4"> {/* Product Details Section */}                                
                                <div className='col-span-1'>
                                    <h1 className='font-bold text-lg'>Description</h1>
                                    <p>Enter details of your product</p>
                                </div>

                                <div className='col-span-2 grid grid-cols-2 gap-4'>
                                    <div> 
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input
                                            id="sku"
                                            value={formData.sku}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                            placeholder="e.g., COF-ESP (Coffee - Espresso)"
                                            className='rounded-md'
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: toTitleCase(e.target.value) })}
                                            placeholder="Product name"
                                            className='rounded-md'
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="price">Selling Price</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={formData.price || ''}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                            placeholder="0.00"
                                            className='rounded-md'
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Select 
                                            
                                            value={formData.category_id?.toString() || ''}
                                            onValueChange={(value) => setFormData({ ...formData, category_id: value ? parseInt(value) : undefined })}
                                            
                                        >
                                            <SelectTrigger className='rounded-md'>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.categoryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>                                  
                                </div>                                                                    
                            </div>
                            <Separator className='my-3'></Separator>
                            <div className="grid grid-cols-3 gap-4">
                                <div className='col-span-1'>
                                    <h1 className='font-bold text-lg'>Product Ingredients</h1>
                                    <p>Enter ingredients of your product</p>
                                </div>
                                
                                <div className='flex flex-col gap-4 col-span-2'>

                                    <div className="border-1 rounded-md p-4"> {/* Product Variations Section */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h1 className='font-bold text-lg'>Product Variations</h1>
                                                <p className="text-sm text-muted-foreground">Specify different sizes, colors, or other attributes for this product.</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={handleAddVariation}
                                                className="rounded-md"
                                            >
                                                <Plus />
                                                Add Variation
                                            </Button>
                                        </div>
                                        <Separator className='my-3'/>
                                        {variations.length > 0 && (
                                            <div>
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-4 gap-2 items-center">
                                                        <Label className='col-span-2'>Variation Name</Label>
                                                        <Label>Price</Label>
                                                    </div>
                                                        {variations.map((variation, index) => (
                                                            <div key={variation.id} className="grid grid-cols-4 gap-2 items-center">
                                                                <div className='col-span-2'>
                                                                    <Input
                                                                        value={variation.name}
                                                                        onChange={(e) => {
                                                                            const updated = { ...variation, name: e.target.value };
                                                                            setVariations(variations.map(v => v.id === variation.id ? updated : v));
                                                                        }}
                                                                        placeholder="e.g., Small"
                                                                        className='rounded-md w-50'
                                                                    />
                                                                </div>
                                                                <div>

                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={variation.price || ''}
                                                                        onChange={(e) => {
                                                                            const updated = { ...variation, price: parseFloat(e.target.value) || 0 };
                                                                            setVariations(variations.map(v => v.id === variation.id ? updated : v));
                                                                        }}
                                                                        placeholder="0.00"
                                                                        className='rounded-md'
                                                                    />
                                                                </div>
                                                                {index > 0 && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => setVariations(variations.filter(v => v.id !== variation.id))}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                    <div className="border-1 rounded-md p-4"> {/* Product Ingredients Section */}
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="sync-inventory">Sync with Inventory</Label>
                                            <Switch id="sync-inventory" checked={syncWithInventory} onCheckedChange={(checked) => {
                                                setSyncWithInventory(checked);
                                                if (checked && !productIngredients['base']) {
                                                    handleAddIngredient();
                                                } else if (!checked) {
                                                    setProductIngredients({});
                                                }
                                            }} />                                            
                                        </div>
                                        <Separator className='my-3'/>
                                        <p className="text-sm text-muted-foreground">Specify ingredients of this product.</p>
                                        {syncWithInventory && (
                                            <div className="pb-4 mt-4">
                                                {/* Tabs for Base and Variations */}
                                                <Tabs value={activeVariationTab} onValueChange={setActiveVariationTab} className="w-full">
                                                    <TabsList className="grid w-full grid-cols-[auto_repeat(variations.length,1fr)]">
                                                        <TabsTrigger value="base">Base</TabsTrigger>
                                                        {variations.map((variation) => (
                                                            <TabsTrigger key={variation.id} value={variation.id.toString()}>
                                                                {variation.name || 'New Variation'}
                                                            </TabsTrigger>
                                                        ))}
                                                    </TabsList>

                                                    <TabsContent value={activeVariationTab} className="mt-4">
                                                        <div className="space-y-2">
                                                            <div className='grid grid-cols-6 gap-2'>
                                                                <Label className='col-span-2'>Ingredient</Label>
                                                                <Label>Qty</Label>
                                                                <Label>UOM</Label>
                                                                <Label>Unit Cost</Label>
                                                            </div>
                                                            {(productIngredients[activeVariationTab] || []).map((ing, index) => (
                                                                <div key={index} className="grid grid-cols-6 gap-2 items-center">
                                                                    <div className='col-span-2'>
                                                                        <Select value={ing.ingredientId?.toString() || ''} onValueChange={(value) => {
                                                                    const updated = [...(productIngredients[activeVariationTab] || [])];
                                                                    updated[index] = { ...ing, ingredientId: parseInt(value), totalCost: ing.costPerUnit * (ing.quantity || 0) };
                                                                    setProductIngredients({
                                                                        ...productIngredients,
                                                                        [activeVariationTab]: updated
                                                                    });
                                                                }}>
                                                                    <SelectTrigger className='rounded-md'>
                                                                        <SelectValue placeholder="Select ingredient" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {ingredients.map((ingredient: any) => (
                                                                            <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                                                                                {ingredient.description}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className='col-span-1'>
                                                                <Input
                                                                    type="number"
                                                                    value={ing.quantity || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...(productIngredients[activeVariationTab] || [])];
                                                                        updated[index] = { ...ing, quantity: parseInt(e.target.value) || 0, totalCost: ing.costPerUnit * (parseInt(e.target.value) || 0) };
                                                                        setProductIngredients({
                                                                            ...productIngredients,
                                                                            [activeVariationTab]: updated
                                                                        });
                                                                    }}
                                                                    min="1"
                                                                    className='w-25 rounded-md '
                                                                />
                                                            </div>
                                                            <div className='col-span-1'>
                                                                <Select value={ing.uom} onValueChange={(value) => {
                                                                    const updated = [...(productIngredients[activeVariationTab] || [])];
                                                                    updated[index] = { ...ing, uom: value };
                                                                    setProductIngredients({
                                                                        ...productIngredients,
                                                                        [activeVariationTab]: updated
                                                                    });
                                                                }}>
                                                                    <SelectTrigger className='rounded-md'>
                                                                        <SelectValue placeholder="UOM" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {units.map((unit: any) => (
                                                                            <SelectItem key={unit.id} value={unit.uom_code}>
                                                                                {unit.uom_code}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className='col-span-1'>
                                                                <Input className="rounded-md w-30 bg-white" type="number" placeholder="₱ 0.00" value={"₱" + ing.costPerUnit.toFixed(2)} readOnly />
                                                            </div>                                          
                                                            {index > 0 && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleRemoveIngredient(index)}
                                                                    className='col-span-1 w-20 max-w-20 h-10 rounded-md pb-0 self-end '
                                                                >
                                                                    <Trash2 className="h-6 w-6" />
                                                                </Button>
                                                            )}           
                                                            
                                                        </div>
                                                    ))}
                                                    <Button
                                                        size="sm"
                                                        onClick={handleAddIngredient}
                                                        className="rounded-md w-35"
                                                    >
                                                        <Plus />
                                                        Add Ingredient
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                </div>
                            </div>



                        </div>

                        <div className="flex gap-2 p-4 mt-auto">
                            <Button onClick={handleSaveProduct} 
                                    className="flex-1 rounded-md">
                                    {editingProduct ? 'Update' : 'Save'}
                            </Button>
                            <Button onClick={() => { 
                                    setIsDialogOpen(false); 
                                    setIsAdding(false); 
                                    setEditingProduct(null); 
                                    setFormData({ sku: '', name: '', price: 0, category_id: undefined }); 
                                }} variant="outline" className="flex-1 rounded-md">
                                    Cancel
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="h-125 overflow-y-auto border rounded-md">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="text-xs font-bold text-slate-900">SKU</TableHead>
                                <TableHead className="text-xs font-bold text-slate-900">Name</TableHead>
                                <TableHead className="text-xs font-bold text-slate-900">Price</TableHead>
                                <TableHead className="text-xs font-bold text-slate-900">Category</TableHead>
                                <TableHead className="text-xs font-bold text-slate-900">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="text-xs font-medium">{product.sku}</TableCell>
                                    <TableCell className="text-xs">{product.name}</TableCell>
                                    <TableCell className="text-xs">₱{product.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-xs">{product.category || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleEditProduct(product)} size="sm" className="rounded-md bg-blue-300 text-blue-900 hover:bg-blue-400"><Edit /></Button>
                                            <Button onClick={() => handleDeleteProduct(Number(product.id))} size="sm" className='rounded-md' variant="destructive"><Trash2 /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
