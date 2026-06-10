'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from 'lucide-react';
import { CreateProductRequest, UpdateProductRequest, CsvProductRow, ProductVariationResponse, CreateVariationRequest, UpdateVariationRequest } from '@/lib/types';
import { createProduct, updateProduct, deleteProduct, batchImportProducts, getProductVariations, createVariation, updateVariation, deleteVariation } from '@/lib/data';
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
    const [hasVariations, setHasVariations] = useState(false);
    const [newVariation, setNewVariation] = useState({ name: '', price: 0 });
    const [syncWithInventory, setSyncWithInventory] = useState(false);
    const [productIngredients, setProductIngredients] = useState<Array<{ ingredientId: number | undefined; uom: string; costPerUnit: number; quantity: number; totalCost: number }>>([]);
    const [newIngredient, setNewIngredient] = useState({ ingredientId: undefined, uom: '', costPerUnit: 0, quantity: 1 });

    const toTitleCase = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const handleAddProduct = async () => {
        setIsAdding(true);
        setEditingProduct(null);
        setFormData({ sku: '', name: '', price: 0, category_id: undefined });
        setVariations([]);
        setHasVariations(false);
        setNewVariation({ name: '', price: 0 });
        setSyncWithInventory(false);
        setProductIngredients([]);
        setNewIngredient({ ingredientId: undefined, uom: '', costPerUnit: 0, quantity: 1 });
        setIsDialogOpen(true);
    };

    const handleAddIngredient = () => {
        const newBlankIngredient = {
            ingredientId: undefined,
            uom: '',
            costPerUnit: 0,
            quantity: 1,
            totalCost: 0,
        };
        setProductIngredients([...productIngredients, newBlankIngredient]);
    };

    const handleRemoveIngredient = (index: number) => {
        setProductIngredients(productIngredients.filter((_, i) => i !== index));
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

            // Save variations
            if (hasVariations && variations.length > 0) {
                for (const variation of variations) {
                    const variationData: CreateVariationRequest = {
                        product_id: productId,
                        name: variation.name,
                        price: variation.price,
                    };
                    await createVariation(variationData);
                }
            }

            // Save ingredients if sync with inventory is enabled
            if (syncWithInventory && productIngredients.length > 0) {
                // TODO: Implement ingredient saving logic when backend is ready
                console.log('Ingredients to save:', productIngredients);
            }

            setFormData({ sku: '', name: '', price: 0, category_id: undefined });
            setVariations([]);
            setHasVariations(false);
            setProductIngredients([]);
            setSyncWithInventory(false);
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
        setHasVariations(productVariations.length > 0);

        // Load product ingredients only when editing
        setProductIngredients([]);
        setSyncWithInventory(false);

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
            name: newVariation.name,
            price: newVariation.price,
            is_active: true,
        };
        setVariations([...variations, newVariationWithId]);
        setNewVariation({ name: '', price: 0 });
        setHasVariations(true);
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
        <Card>
            <CardHeader className='flex items-center justify-between'>
                <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Manage product catalog</CardDescription>
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
                    >
                        {isUploading ? 'Uploading...' : 'Upload CSV'}
                    </Button>
                    <Button onClick={handleAddProduct}>Add Product</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="!w-[60vw] !max-w-[60vw] !h-[800px] !max-h-[800px] !pt-4 flex flex-col scrollbar-hide">
                        <DialogHeader className='!mb-2 !pb-0 !p-0 !space-y-1'>
                            <DialogTitle className='!text-lg'>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                            <DialogDescription className='!text-sm'>
                                {editingProduct ? 'Update the product details below.' : 'Fill in the details to add a new product.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto scrollbar-hide">
                            <div className="grid grid-cols-2 gap-4 p-4 sticky top-0 bg-background z-10"> {/* Product Details Section */}
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

                            <div className="border-1 rounded-md p-4"> {/* Product Variations Section */}
                                <div>{/* div1*/}
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="has-variations">Enable Variations</Label>
                                        <Switch id="has-variations" checked={hasVariations} onCheckedChange={(checked) => setHasVariations(checked)} />                               
                                    </div>
                                    <Separator className='my-3'/>
                                    <p className="text-sm text-muted-foreground">Specify different sizes, colors, or other attributes for this product.</p>
                                    {hasVariations && ( 
                                        <div className="border-b pb-4 px-4">
                                            <h3 className="font-semibold mb-3">Product Variations</h3>
                                            <div className="space-y-2"> 
                                                {variations.map((variation) => (
                                                    <div key={variation.id} className="grid grid-cols-[2fr_1fr_auto] gap-2 items-center">
                                                        <div>
                                                            <Label className="text-xs">Variation Name</Label>
                                                            <Input
                                                                value={variation.name}
                                                                onChange={(e) => {
                                                                    const updated = { ...variation, name: e.target.value };
                                                                    setVariations(variations.map(v => v.id === variation.id ? updated : v));
                                                                }}
                                                                placeholder="e.g., Small"
                                                                className='rounded-md'
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Price</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={variation.price}
                                                                onChange={(e) => {
                                                                    const updated = { ...variation, price: parseFloat(e.target.value) || 0 };
                                                                    setVariations(variations.map(v => v.id === variation.id ? updated : v));
                                                                }}
                                                                placeholder="0.00"
                                                                className='rounded-md'
                                                            />
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => setVariations(variations.filter(v => v.id !== variation.id))}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <div className="grid grid-cols-[2fr_1fr_auto] gap-2 items-center">
                                                    <div>
                                                        <Label className="text-xs">Variation Name</Label>
                                                        <Input
                                                            value={newVariation.name}
                                                            onChange={(e) => setNewVariation({ ...newVariation, name: e.target.value })}
                                                            placeholder="e.g., Small"
                                                            className='rounded-md'
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Price</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={newVariation.price}
                                                            onChange={(e) => setNewVariation({ ...newVariation, price: parseFloat(e.target.value) || 0 })}
                                                            placeholder="0.00"
                                                            className='rounded-md'
                                                        />
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={handleAddVariation}
                                                        className="mt-4"
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </div>
                                        </div> 
                                    )}
                                </div>{/* div1 */}
                            </div>


                            <div className="border-1 rounded-md p-4">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="sync-inventory">Sync with Inventory</Label>
                                    <Switch id="sync-inventory" checked={syncWithInventory} onCheckedChange={(checked) => setSyncWithInventory(checked)} />                                            
                                </div>
                                <Separator className='my-3'/>
                                <p className="text-sm text-muted-foreground">Specify ingredients of this product.</p>
                                {syncWithInventory && (
                                    <div className="pb-4 mt-4">
                                        <div className="space-y-2">
                                            <div className='grid grid-cols-7 gap-2'>
                                                <Label className='col-span-2'>Ingredient</Label>
                                                <Label>Quantity</Label>
                                                <Label>UOM</Label>
                                                <Label>Unit Cost</Label>
                                            </div>
                                            {productIngredients.map((ing, index) => (
                                                <div key={index} className="grid grid-cols-7 gap-2 items-center">
                                                    <div className='col-span-2'>
                                                        
                                                        <Select value={ing.ingredientId?.toString() || ''} onValueChange={(value) => {
                                                            const updated = [...productIngredients];
                                                            updated[index] = { ...ing, ingredientId: parseInt(value), totalCost: ing.costPerUnit * ing.quantity };
                                                            setProductIngredients(updated);
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
                                                            value={ing.quantity}
                                                            onChange={(e) => {
                                                                const updated = [...productIngredients];
                                                                updated[index] = { ...ing, quantity: parseInt(e.target.value) || 1, totalCost: ing.costPerUnit * (parseInt(e.target.value) || 1) };
                                                                setProductIngredients(updated);
                                                            }}
                                                            min="1"
                                                            className='w-25 rounded-md '
                                                        />
                                                    </div>
                                                    <div className='col-span-1'>
                                                        <Select value={ing.uom} onValueChange={(value) => {
                                                            const updated = [...productIngredients];
                                                            updated[index] = { ...ing, uom: value };
                                                            setProductIngredients(updated);
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
                                                     <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleRemoveIngredient(index)}
                                                            className='col-span-1 w-20 max-w-20 h-10 rounded-md pb-0 self-end '
                                                            
                                                        >
                                                            <Trash2 className="h-6 w-6" />
                                                        </Button>           
                                                    
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

                        <div className="flex gap-2 p-4 mt-auto">
                            <Button onClick={handleSaveProduct} className="flex-1">
                                {editingProduct ? 'Update' : 'Save'}
                            </Button>
                            <Button onClick={() => { setIsDialogOpen(false); setIsAdding(false); setEditingProduct(null); setFormData({ sku: '', name: '', price: 0, category_id: undefined }); }} variant="outline" className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="h-122 overflow-y-auto border rounded-md">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="font-bold text-slate-900">SKU</TableHead>
                                <TableHead className="font-bold text-slate-900">Name</TableHead>
                                <TableHead className="font-bold text-slate-900">Price</TableHead>
                                <TableHead className="font-bold text-slate-900">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.sku}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>₱{product.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleEditProduct(product)} size="sm" variant="outline">Edit</Button>
                                            <Button onClick={() => handleDeleteProduct(Number(product.id))} size="sm" variant="destructive">Delete</Button>
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
