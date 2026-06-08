'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from 'lucide-react';
import { CreateProductRequest, UpdateProductRequest, CsvProductRow, BulkRecipeLine } from '@/lib/types';
import { createProduct, updateProduct, deleteProduct, batchImportProducts, saveRecipeBulk, getProductRecipe } from '@/lib/data';
import { toast } from 'sonner';

interface ProductsTabProps {
    products: any[];
    categories: any[];
    ingredients: any[];
    units: any[];
    conversions: any[];
    loadInventoryData: () => Promise<void>;
    loadProductRecipe: (productId: string) => Promise<void>;
    productRecipes: Map<string, any[]>;
}

export default function ProductsTab({ products, categories, ingredients, units, conversions, loadInventoryData, loadProductRecipe, productRecipes }: ProductsTabProps) {
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
    const [recipeLines, setRecipeLines] = useState([{
        id: undefined as number | undefined,
        ingredient_id: undefined as number | undefined,
        qty: 0,
        uom_code: '',
        unit_cost: 0,
        total_cost: 0,
    }]);
    const [originalRecipeLines, setOriginalRecipeLines] = useState<any[]>([]);

    const toTitleCase = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const handleAddProduct = async () => {
        setIsAdding(true);
        setEditingProduct(null);
        setFormData({ sku: '', name: '', price: 0, category_id: undefined });
        setRecipeLines([{
            id: undefined,
            ingredient_id: undefined,
            qty: 0,
            uom_code: '',
            unit_cost: 0,
            total_cost: 0,
        }]);
        setIsDialogOpen(true);
    };

    const handleIngredientChange = (index: number, ingredientId: number) => {
        const ingredient = ingredients.find(ing => ing.id === ingredientId);
        const newLines = [...recipeLines];
        newLines[index].ingredient_id = ingredientId;

        if (ingredient) {
            newLines[index].unit_cost = ingredient.cost_price;
            newLines[index].total_cost = newLines[index].qty * ingredient.cost_price;

            if (ingredient.usage_unit_id) {
                const usageUnit = units.find(u => u.id === ingredient.usage_unit_id);
                if (usageUnit) {
                    newLines[index].uom_code = usageUnit.unit_code;
                }
            }
        }

        setRecipeLines(newLines);
    };

    const handleQtyChange = (index: number, qty: number) => {
        const newLines = [...recipeLines];
        newLines[index].qty = qty;
        newLines[index].total_cost = qty * newLines[index].unit_cost;
        setRecipeLines(newLines);
    };

    const handleUomChange = (index: number, uomCode: string) => {
        const newLines = [...recipeLines];
        newLines[index].uom_code = uomCode;

        const ingredient = ingredients.find(ing => ing.id === newLines[index].ingredient_id);
        if (ingredient) {
            const baseUnitCost = ingredient.cost_price;

            const usageUnit = units.find(u => u.id === ingredient.usage_unit_id);
            if (usageUnit && usageUnit.unit_code !== uomCode) {
                const conversion = conversions.find(c =>
                    c.unit_to_convert === usageUnit.unit_code && c.convert_to === uomCode
                );
                if (conversion) {
                    newLines[index].unit_cost = baseUnitCost * conversion.rate;
                } else {
                    const reverseConversion = conversions.find(c =>
                        c.unit_to_convert === uomCode && c.convert_to === usageUnit.unit_code
                    );
                    if (reverseConversion && reverseConversion.rate > 0) {
                        newLines[index].unit_cost = baseUnitCost / reverseConversion.rate;
                    } else {
                        newLines[index].unit_cost = baseUnitCost;
                    }
                }
            } else {
                newLines[index].unit_cost = baseUnitCost;
            }

            newLines[index].total_cost = newLines[index].qty * newLines[index].unit_cost;
        }

        setRecipeLines(newLines);
    };

    const handleAddRecipeLine = () => {
        setRecipeLines([...recipeLines, {
            id: undefined,
            ingredient_id: undefined,
            qty: 0,
            uom_code: '',
            unit_cost: 0,
            total_cost: 0,
        }]);
    };

    const handleRemoveRecipeLine = (index: number) => {
        const newLines = recipeLines.filter((_, i) => i !== index);
        setRecipeLines(newLines);
    };

    const handleSaveProduct = async () => {
        if (!formData.sku || !formData.name || formData.price <= 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        const linesWithIngredient = recipeLines.filter(line => line.ingredient_id);
        if (linesWithIngredient.length === 0) {
            toast.error('Please select at least one ingredient for the recipe');
            return;
        }

        const validRecipeLines = recipeLines.filter(line => line.ingredient_id && line.qty > 0);
        if (validRecipeLines.length === 0) {
            toast.error('Please enter a quantity greater than 0 for at least one ingredient');
            return;
        }

        try {
            let productId: number;

            const recipeCost = validRecipeLines.reduce((sum, line) => sum + line.total_cost, 0);

            if (editingProduct) {
                const data: UpdateProductRequest = {
                    id: parseInt(editingProduct.id),
                    sku: formData.sku,
                    name: formData.name,
                    price: formData.price,
                    category_id: formData.category_id,
                    recipe_cost: recipeCost,
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
                    recipe_cost: recipeCost,
                };
                const result = await createProduct(data);
                productId = result.id;
                toast.success('Product added successfully');
            }

            const bulkRecipeLines: BulkRecipeLine[] = validRecipeLines.map(line => ({
                id: line.id,
                ingredient_id: line.ingredient_id!,
                usage_qty: line.qty,
                usage_uom_code: line.uom_code,
                cost: line.total_cost,
                isNew: !line.id,
                isDeleted: false,
            }));

            // Mark deleted lines
            const deletedLines = originalRecipeLines.filter(original =>
                !validRecipeLines.find(current => current.id === original.id)
            );
            deletedLines.forEach(deleted => {
                bulkRecipeLines.push({
                    id: deleted.id,
                    ingredient_id: deleted.ingredient_id,
                    usage_qty: deleted.qty,
                    usage_uom_code: deleted.uom_code,
                    cost: deleted.total_cost,
                    isNew: false,
                    isDeleted: true,
                });
            });

            await saveRecipeBulk(productId, bulkRecipeLines);

            setFormData({ sku: '', name: '', price: 0, category_id: undefined });
            setRecipeLines([{
                id: undefined,
                ingredient_id: undefined,
                qty: 0,
                uom_code: '',
                unit_cost: 0,
                total_cost: 0,
            }]);
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

        // Load the product recipe directly
        const recipe = await getProductRecipe(parseInt(product.id.toString()));

        // Populate recipe lines from loaded recipe
        if (recipe && recipe.length > 0) {
            const lines = recipe.map((r: any) => {
                const ingredient = ingredients.find(ing => ing.id === r.ingredient_id);
                let unitCost = ingredient ? ingredient.cost_price : 0;

                // Calculate unit cost based on UOM conversion
                if (ingredient) {
                    const baseUnitCost = ingredient.cost_price;
                    const usageUnit = units.find(u => u.id === ingredient.usage_unit_id);
                    if (usageUnit && usageUnit.unit_code !== r.usage_uom_code) {
                        const conversion = conversions.find(c =>
                            c.unit_to_convert === usageUnit.unit_code && c.convert_to === r.usage_uom_code
                        );
                        if (conversion) {
                            unitCost = baseUnitCost * conversion.rate;
                        } else {
                            const reverseConversion = conversions.find(c =>
                                c.unit_to_convert === r.usage_uom_code && c.convert_to === usageUnit.unit_code
                            );
                            if (reverseConversion && reverseConversion.rate > 0) {
                                unitCost = baseUnitCost / reverseConversion.rate;
                            }
                        }
                    }
                }

                return {
                    id: r.id,
                    ingredient_id: r.ingredient_id,
                    qty: r.usage_qty,
                    uom_code: r.usage_uom_code,
                    unit_cost: unitCost,
                    total_cost: r.usage_qty * unitCost,
                };
            });
            setRecipeLines(lines);
            setOriginalRecipeLines(lines);
        } else {
            setRecipeLines([{
                id: undefined,
                ingredient_id: undefined,
                qty: 0,
                uom_code: '',
                unit_cost: 0,
                total_cost: 0,
            }]);
            setOriginalRecipeLines([]);
        }

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
                    <DialogContent className="!w-[70vw] !max-w-[70vw] !h-[800px] !max-h-[800px] !pt-4 flex flex-col">
                        <DialogHeader className='!mb-2 !pb-0 !p-0 !space-y-1'>
                            <DialogTitle className='!text-lg'>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                            <DialogDescription className='!text-sm'>
                                {editingProduct ? 'Update the product details below.' : 'Fill in the details to add a new product.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-3 gap-6 p-4 flex-1 min-h-0">
                            <div className="col-span-2 flex flex-col min-h-0">
                                <div className="grid grid-cols-2 gap-4 flex-shrink-0 border-b pb-4">
                                    <div>
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input
                                            id="sku"
                                            value={formData.sku}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                            placeholder="e.g., COF-ESP (Coffee - Espresso)"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: toTitleCase(e.target.value) })}
                                            placeholder="Product name"
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
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Select
                                            value={formData.category_id?.toString() || ''}
                                            onValueChange={(value) => setFormData({ ...formData, category_id: value ? parseInt(value) : undefined })}
                                        >
                                            <SelectTrigger>
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

                                <div className=" pt-4 flex-1 flex flex-col min-h-0">
                                    <h3 className="font-semibold mb-3 flex-shrink-0">Recipe</h3>
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                        {recipeLines.map((line, index) => (
                                            <div key={index} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 items-end">
                                                <div>
                                                    <Select
                                                        value={line.ingredient_id?.toString() || ''}
                                                        onValueChange={(value) => handleIngredientChange(index, parseInt(value))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select ingredient" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ingredients.map((ing) => (
                                                                <SelectItem key={ing.id} value={ing.id.toString()}>
                                                                    {ing.description}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <div>
                                                    <Label htmlFor={`qty-${index}`} className="text-xs">Qty</Label>
                                                    <Input
                                                        id={`qty-${index}`}
                                                        type="number"
                                                        step="0.01"
                                                        value={line.qty || ''}
                                                        onChange={(e) => handleQtyChange(index, parseFloat(e.target.value) || 0)}
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`uom-${index}`} className="text-xs">UOM</Label>
                                                    <Select
                                                        value={line.uom_code}
                                                        onValueChange={(value) => handleUomChange(index, value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="UOM" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(() => {
                                                                const selectedIngredient = ingredients.find(ing => ing.id === line.ingredient_id);
                                                                const preferredType = selectedIngredient?.preferred_unit_type || 'weight';
                                                                return units
                                                                    .filter(unit => unit.unit_type === preferredType)
                                                                    .map((unit) => (
                                                                        <SelectItem key={unit.id} value={unit.unit_code}>
                                                                            {unit.unit_code}
                                                                        </SelectItem>
                                                                    ));
                                                            })()}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor={`unit-cost-${index}`} className="text-xs">Unit Cost</Label>
                                                    <Input
                                                        id={`unit-cost-${index}`}
                                                        type="number"
                                                        step="0.01"
                                                        value={line.unit_cost || ''}
                                                        readOnly
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 min-w-[80px]">
                                                        <Label htmlFor={`total-cost-${index}`} className="text-xs">Total</Label>
                                                        <Input
                                                            id={`total-cost-${index}`}
                                                            type="number"
                                                            step="0.01"
                                                            value={line.total_cost || ''}
                                                            readOnly
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    {recipeLines.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveRecipeLine(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddRecipeLine}
                                        className="w-full mt-2"
                                    >
                                        + Add Ingredient
                                    </Button>
                                </div>
                            </div>

                            <div className="col-span-1 bg-slate-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-4">Cost Analysis</h3>
                                <div className="space-y-6">
                                    <div>
                                        <Label>Selling Price</Label>
                                        <div className="text-3xl font-bold">₱{formData.price.toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <Label>Food Cost</Label>
                                        <div className="text-3xl font-bold">₱{recipeLines.reduce((sum, line) => sum + line.total_cost, 0).toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <Label>Gross Margin</Label>
                                        <div className="text-3xl font-bold">₱{(formData.price - recipeLines.reduce((sum, line) => sum + line.total_cost, 0)).toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <Label>Food Cost %</Label>
                                        <div className="text-3xl font-bold">{formData.price > 0 ? ((recipeLines.reduce((sum, line) => sum + line.total_cost, 0) / formData.price) * 100).toFixed(1) : 0}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 p-4 mt-auto">
                            <Button onClick={handleSaveProduct} className="flex-1">
                                {editingProduct ? 'Update' : 'Add'}
                            </Button>
                            <Button onClick={() => { setIsDialogOpen(false); setIsAdding(false); setEditingProduct(null); setFormData({ sku: '', name: '', price: 0, category_id: undefined }); setRecipeLines([{ id: undefined, ingredient_id: undefined, qty: 0, uom_code: '', unit_cost: 0, total_cost: 0 }]); }} variant="outline" className="flex-1">
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
