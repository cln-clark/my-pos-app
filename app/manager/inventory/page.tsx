'use client';

import { useState, useEffect } from 'react';
import { ManagerLayout } from "@/components/layout/manager-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePOS } from '@/lib/context';
import { UnitMasterResponse, CreateUnitMasterRequest, ProductsRecipeResponse, CreateIngredientRequest, UpdateIngredientRequest, UpdateIngredientStockRequest, CreateProductRequest, UpdateProductRequest, CreateCategoryRequest, UpdateCategoryRequest, CsvProductRow, BatchImportRequest, CsvIngredientRow, BatchImportIngredientsRequest, BulkRecipeLine } from '@/lib/types';
import { createUnitMaster, getProductRecipe, recalculateProductCost, updateProductPriceFromCost, createIngredient, updateIngredient, deleteIngredient, updateIngredientStock, createProduct, updateProduct, deleteProduct, createCategory, updateCategory, deleteCategory, batchImportProducts, batchImportIngredients, saveRecipeBulk } from '@/lib/data';
import { toast } from 'sonner';

export default function InventoryPage() {
    const { units, ingredients, conversions, products, categories, loadInventoryData } = usePOS();
    const [activeTab, setActiveTab] = useState('products');

    useEffect(() => {
        loadInventoryData();
    }, [loadInventoryData]);

    return (
        <ManagerLayout>
            <div className="flex flex-col h-full">
                <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                        <TabsTrigger value="units">Units</TabsTrigger>
                        <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                        <TabsTrigger value="recipes">Recipes</TabsTrigger>
                        <TabsTrigger value="conversions">Conversions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="products" className="mt-4">
                        <ProductsTab products={products} categories={categories} loadInventoryData={loadInventoryData} />
                    </TabsContent>

                    <TabsContent value="categories" className="mt-4">
                        <CategoriesTab categories={categories} loadInventoryData={loadInventoryData} />
                    </TabsContent>

                    <TabsContent value="units" className="mt-4">
                        <UnitsTab units={units} loadInventoryData={loadInventoryData} />
                    </TabsContent>

                    <TabsContent value="ingredients" className="mt-4">
                        <IngredientsTab ingredients={ingredients} units={units} loadInventoryData={loadInventoryData} />
                    </TabsContent>

                    <TabsContent value="recipes" className="mt-4">
                        <RecipesTab products={products} ingredients={ingredients} units={units} loadInventoryData={loadInventoryData} />
                    </TabsContent>

                    <TabsContent value="conversions" className="mt-4">
                        <ConversionsTab conversions={conversions} loadInventoryData={loadInventoryData} />
                    </TabsContent>
                </Tabs>
            </div>
        </ManagerLayout>
    );
}

function ProductsTab({ products, categories, loadInventoryData }: { products: any[], categories: any[], loadInventoryData: () => Promise<void> }) {
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

    const handleAddProduct = async () => {
        setIsAdding(true);
        setEditingProduct(null);
        setFormData({ sku: '', name: '', price: 0, category_id: undefined });
        setIsDialogOpen(true);
    };

    const handleSaveProduct = async () => {
        if (!formData.sku || !formData.name || formData.price <= 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingProduct) {
                const data: UpdateProductRequest = {
                    id: editingProduct.id,
                    sku: formData.sku,
                    name: formData.name,
                    price: formData.price,
                    category_id: formData.category_id,
                };
                await updateProduct(data);
                toast.success('Product updated successfully');
            } else {
                const data: CreateProductRequest = {
                    sku: formData.sku,
                    name: formData.name,
                    price: formData.price,
                    category_id: formData.category_id,
                };
                await createProduct(data);
                toast.success('Product added successfully');
            }
            setFormData({ sku: '', name: '', price: 0, category_id: undefined });
            setIsAdding(false);
            setEditingProduct(null);
            setIsDialogOpen(false);
            loadInventoryData();
        } catch (error) {
            toast.error(editingProduct ? 'Failed to update product' : 'Failed to add product');
            console.error(error);
        }
    };

    const handleEditProduct = (product: any) => {
        setEditingProduct(product);
        setFormData({
            sku: product.sku,
            name: product.name,
            price: product.price,
            category_id: product.category_id,
        });
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

    const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
                        onChange={handleCsvUpload}
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
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                            <DialogDescription>
                                {editingProduct ? 'Update the product details below.' : 'Fill in the details to add a new product.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 p-4">
                            <div>
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                    placeholder="e.g., PROD-001"
                                />
                            </div>
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Product name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
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
                            <div className="col-span-2 flex gap-2">
                                <Button onClick={handleSaveProduct} className="flex-1">
                                    {editingProduct ? 'Update' : 'Add'}
                                </Button>
                                <Button onClick={() => { setIsDialogOpen(false); setIsAdding(false); setEditingProduct(null); setFormData({ sku: '', name: '', price: 0, category_id: undefined }); }} variant="outline" className="flex-1">
                                    Cancel
                                </Button>
                            </div>
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
                                            <Button onClick={() => handleDeleteProduct(product.id)} size="sm" variant="destructive">Delete</Button>
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

function CategoriesTab({ categories, loadInventoryData }: { categories: any[], loadInventoryData: () => Promise<void> }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        category_code: '',
        category_name: '',
    });

    const handleAddCategory = async () => {
        setIsAdding(true);
        setEditingCategory(null);
        setFormData({ category_code: '', category_name: '' });
        setIsDialogOpen(true);
    };

    const handleSaveCategory = async () => {
        if (!formData.category_code || !formData.category_name) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingCategory) {
                const data: UpdateCategoryRequest = {
                    id: editingCategory.id,
                    category_code: formData.category_code,
                    category_name: formData.category_name,
                };
                await updateCategory(data);
                toast.success('Category updated successfully');
            } else {
                const data: CreateCategoryRequest = {
                    category_code: formData.category_code,
                    category_name: formData.category_name,
                };
                await createCategory(data);
                toast.success('Category added successfully');
            }
            setFormData({ category_code: '', category_name: '' });
            setIsAdding(false);
            setEditingCategory(null);
            setIsDialogOpen(false);
            loadInventoryData();
        } catch (error) {
            toast.error(editingCategory ? 'Failed to update category' : 'Failed to add category');
            console.error(error);
        }
    };

    const handleEditCategory = (category: any) => {
        setEditingCategory(category);
        setFormData({
            category_code: category.categoryCode,
            category_name: category.categoryName,
        });
        setIsDialogOpen(true);
    };

    const handleDeleteCategory = async (categoryId: number) => {
        if (!confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            await deleteCategory(categoryId);
            toast.success('Category deleted successfully');
            loadInventoryData();
        } catch (error) {
            toast.error('Failed to delete category');
            console.error(error);
        }
    };

    return (
        <Card>
            <CardHeader className='flex items-center justify-between'>
                <div>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>Manage product categories</CardDescription>
                </div>
                <Button onClick={handleAddCategory}>Add Category</Button>
            </CardHeader>
            <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                            <DialogDescription>
                                {editingCategory ? 'Update the category details below.' : 'Fill in the details to add a new category.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 p-4">
                            <div>
                                <Label htmlFor="categoryCode">Category Code</Label>
                                <Input
                                    id="categoryCode"
                                    value={formData.category_code}
                                    onChange={(e) => setFormData({ ...formData, category_code: e.target.value.toUpperCase() })}
                                    placeholder="e.g., BEV"
                                />
                            </div>
                            <div>
                                <Label htmlFor="categoryName">Category Name</Label>
                                <Input
                                    id="categoryName"
                                    value={formData.category_name}
                                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                                    placeholder="Beverages"
                                />
                            </div>
                            <div className="col-span-2 flex gap-2">
                                <Button onClick={handleSaveCategory} className="flex-1">
                                    {editingCategory ? 'Update' : 'Add'}
                                </Button>
                                <Button onClick={() => { setIsDialogOpen(false); setIsAdding(false); setEditingCategory(null); setFormData({ category_code: '', category_name: '' }); }} variant="outline" className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="h-122 overflow-y-auto border rounded-md">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="font-bold text-slate-900">Category Code</TableHead>
                                <TableHead className="font-bold text-slate-900">Name</TableHead>
                                <TableHead className="font-bold text-slate-900">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.categoryCode}</TableCell>
                                    <TableCell>{category.categoryName}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleEditCategory(category)} size="sm" variant="outline">Edit</Button>
                                            <Button onClick={() => handleDeleteCategory(category.id)} size="sm" variant="destructive">Delete</Button>
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

function UnitsTab({ units, loadInventoryData }: { units: UnitMasterResponse[], loadInventoryData: () => Promise<void> }) {
    const [unitCode, setUnitCode] = useState('');
    const [unitDescription, setUnitDescription] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddUnit = async () => {
        setIsAdding(true);
        setUnitCode('');
        setUnitDescription('');
        setIsDialogOpen(true);
    };

    const handleSaveUnit = async () => {
        if (!unitCode || !unitDescription) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const data: CreateUnitMasterRequest = {
                unit_code: unitCode,
                unit_description: unitDescription,
            };
            await createUnitMaster(data);
            toast.success('Unit added successfully');
            setUnitCode('');
            setUnitDescription('');
            setIsAdding(false);
            setIsDialogOpen(false);
            loadInventoryData();
        } catch (error) {
            toast.error('Failed to add unit');
            console.error(error);
        }
    };

    return (
        <Card>
            <CardHeader className='flex items-center justify-between'>
                <div>
                    <CardTitle>Units of Measurement</CardTitle>
                    <CardDescription>Manage units of measurement for ingredients</CardDescription>
                </div>
                <Button onClick={handleAddUnit}>Add New Unit</Button>
            </CardHeader>
            <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Unit</DialogTitle>
                            <DialogDescription>
                                Fill in the details to add a new unit of measurement.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 p-4">
                            <div>
                                <Label htmlFor="unitCode">Unit Code</Label>
                                <Input
                                    id="unitCode"
                                    placeholder="e.g., KG"
                                    value={unitCode}
                                    onChange={(e) => setUnitCode(e.target.value.toUpperCase())}
                                />
                            </div>
                            <div>
                                <Label htmlFor="unitDescription">Description</Label>
                                <Input
                                    id="unitDescription"
                                    placeholder="e.g., Kilogram"
                                    value={unitDescription}
                                    onChange={(e) => setUnitDescription(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2 flex gap-2">
                                <Button onClick={handleSaveUnit} className="flex-1">Save Unit</Button>
                                <Button onClick={() => { setIsDialogOpen(false); setIsAdding(false); setUnitCode(''); setUnitDescription(''); }} variant="outline" className="flex-1">Cancel</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="h-122 overflow-y-auto border rounded-md">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="font-bold text-slate-900">Code</TableHead>
                                <TableHead className="font-bold text-slate-900">Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {units.map((unit) => (
                                <TableRow key={unit.id}>
                                    <TableCell className="font-medium">{unit.unit_code}</TableCell>
                                    <TableCell>{unit.unit_description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

function IngredientsTab({ ingredients, units, loadInventoryData }: { ingredients: any[], units: UnitMasterResponse[], loadInventoryData: () => Promise<void> }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<any>(null);
    const [restockingIngredient, setRestockingIngredient] = useState<any>(null);
    const [restockAmount, setRestockAmount] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        cost_price: 0,
        min_stock_lvl: 0,
        max_stock_lvl: 0,
        usage_unit_id: null as number | null,
        base_stock_qty: 0,
    });

    const handleAddIngredient = async () => {
        setIsAdding(true);
        setEditingIngredient(null);
        setFormData({ description: '', cost_price: 0, min_stock_lvl: 0, max_stock_lvl: 0, usage_unit_id: null, base_stock_qty: 0 });
        setIsDialogOpen(true);
    };

    const handleSaveIngredient = async () => {
        if (!formData.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingIngredient) {
                const data: UpdateIngredientRequest = {
                    id: editingIngredient.id,
                    description: formData.description,
                    cost_price: formData.cost_price,
                    min_stock_lvl: formData.min_stock_lvl,
                    max_stock_lvl: formData.max_stock_lvl,
                    usage_unit_id: formData.usage_unit_id,
                    base_stock_qty: formData.base_stock_qty,
                };
                await updateIngredient(data);
                toast.success('Ingredient updated successfully');
            } else {
                const data: CreateIngredientRequest = {
                    description: formData.description,
                    cost_price: formData.cost_price,
                    min_stock_lvl: formData.min_stock_lvl,
                    max_stock_lvl: formData.max_stock_lvl,
                    usage_unit_id: formData.usage_unit_id,
                    base_stock_qty: formData.base_stock_qty,
                };
                await createIngredient(data);
                toast.success('Ingredient added successfully');
            }
            setFormData({ description: '', cost_price: 0, min_stock_lvl: 0, max_stock_lvl: 0, usage_unit_id: null, base_stock_qty: 0 });
            setIsAdding(false);
            setEditingIngredient(null);
            setIsDialogOpen(false);
            loadInventoryData();
        } catch (error) {
            toast.error(editingIngredient ? 'Failed to update ingredient' : 'Failed to add ingredient');
            console.error(error);
        }
    };

    const handleEditIngredient = (ingredient: any) => {
        setEditingIngredient(ingredient);
        setFormData({
            description: ingredient.description,
            cost_price: ingredient.cost_price,
            min_stock_lvl: ingredient.min_stock_lvl,
            max_stock_lvl: ingredient.max_stock_lvl,
            usage_unit_id: ingredient.usage_unit_id,
            base_stock_qty: ingredient.base_stock_qty,
        });
        setIsDialogOpen(true);
    };

    const handleDeleteIngredient = async (ingredientId: number) => {
        try {
            await deleteIngredient(ingredientId);
            toast.success('Ingredient deleted successfully');
            loadInventoryData();
        } catch (error) {
            toast.error('Failed to delete ingredient');
            console.error(error);
        }
    };

    const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
            const requiredHeaders = ['description', 'cost_price'];

            if (!requiredHeaders.every(h => headers.includes(h))) {
                toast.error('CSV must have at minimum: description, cost_price');
                setIsUploading(false);
                return;
            }

            const csvIngredients: CsvIngredientRow[] = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length < 3) continue;

                const costPrice = parseFloat(values[2]);
                if (isNaN(costPrice) || costPrice <= 0) {
                    toast.error(`Row ${i + 1}: Invalid cost_price value`);
                    continue;
                }

                csvIngredients.push({
                    ingr_code: values[0] || '',
                    description: values[1],
                    cost_price: costPrice,
                    base_stock_qty: values[3] ? parseInt(values[3]) || 0 : 0,
                    unit_code: values[4] || '',
                    min_stock_lvl: values[5] ? parseInt(values[5]) || 0 : 0,
                    max_stock_lvl: values[6] ? parseInt(values[6]) || 0 : 0,
                    last_cost: values[7] ? parseFloat(values[7]) || 0 : 0,
                });
            }

            if (csvIngredients.length === 0) {
                toast.error('No valid ingredients found in CSV');
                setIsUploading(false);
                return;
            }

            const result = await batchImportIngredients({ ingredients: csvIngredients });

            if (result.error_count > 0) {
                toast.error(`Import completed with ${result.success_count} successes and ${result.error_count} errors`);
                result.errors.forEach(err => console.error(err));
            } else {
                toast.success(`Successfully imported ${result.success_count} ingredients`);
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

    const handleRestock = (ingredient: any) => {
        setRestockingIngredient(ingredient);
        setRestockAmount(0);
        setIsRestockDialogOpen(true);
    };

    const handleConfirmRestock = async () => {
        if (!restockingIngredient || restockAmount <= 0) {
            toast.error('Please enter a valid restock amount');
            return;
        }

        try {
            const data: UpdateIngredientStockRequest = {
                ingredient_id: restockingIngredient.id,
                quantity_change: restockAmount,
            };
            await updateIngredientStock(data);
            toast.success(`Restocked ${restockingIngredient.description} by ${restockAmount}`);
            setRestockingIngredient(null);
            setRestockAmount(0);
            setIsRestockDialogOpen(false);
            loadInventoryData();
        } catch (error) {
            toast.error('Failed to restock ingredient');
            console.error(error);
        }
    };

    const getUnitDescription = (unitId: number | null) => {
        if (!unitId) return 'N/A';
        const unit = units.find(u => u.id === unitId);
        return unit ? unit.unit_description : 'N/A';
    };

    const isLowStock = (ingredient: any) => ingredient.base_stock_qty < ingredient.min_stock_lvl;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Ingredients</CardTitle>
                        <CardDescription>Manage ingredient inventory and stock levels</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleCsvUpload}
                            className="hidden"
                            id="ingredientCsvUpload"
                        />
                        <label htmlFor="ingredientCsvUpload">
                            <Button variant="outline" disabled={isUploading} asChild>
                                <span>{isUploading ? 'Uploading...' : 'Upload CSV'}</span>
                            </Button>
                        </label>
                        <Button onClick={handleAddIngredient}>Add Ingredient</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingIngredient ? 'Edit Ingredient' : 'Add Ingredient'}</DialogTitle>
                            <DialogDescription>
                                {editingIngredient ? 'Update the ingredient details below.' : 'Fill in the details to add a new ingredient.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 p-4">
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="costPrice">Cost Price</Label>
                                <Input
                                    id="costPrice"
                                    type="number"
                                    step="0.01"
                                    value={formData.cost_price}
                                    onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                                />
                                {editingIngredient && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Last Cost: ₱{editingIngredient.last_cost?.toFixed(2) || '0.00'}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="minStock">Min Stock</Label>
                                <Input
                                    id="minStock"
                                    type="number"
                                    value={formData.min_stock_lvl}
                                    onChange={(e) => setFormData({ ...formData, min_stock_lvl: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="maxStock">Max Stock</Label>
                                <Input
                                    id="maxStock"
                                    type="number"
                                    value={formData.max_stock_lvl}
                                    onChange={(e) => setFormData({ ...formData, max_stock_lvl: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="baseStock">Base Stock</Label>
                                <Input
                                    id="baseStock"
                                    type="number"
                                    value={formData.base_stock_qty}
                                    onChange={(e) => setFormData({ ...formData, base_stock_qty: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="usageUnit">Usage Unit</Label>
                                <select
                                    id="usageUnit"
                                    className="w-full mt-1 p-2 border rounded-md"
                                    value={formData.usage_unit_id || ''}
                                    onChange={(e) => setFormData({ ...formData, usage_unit_id: e.target.value ? parseInt(e.target.value) : null })}
                                >
                                    <option value="">None</option>
                                    {units.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.unit_description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2 flex gap-2">
                                <Button onClick={handleSaveIngredient} className="flex-1">
                                    {editingIngredient ? 'Update' : 'Add'}
                                </Button>
                                <Button onClick={() => { setIsDialogOpen(false); setIsAdding(false); setEditingIngredient(null); setFormData({ description: '', cost_price: 0, min_stock_lvl: 0, max_stock_lvl: 0, usage_unit_id: null, base_stock_qty: 0 }); }} variant="outline" className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Restock Ingredient</DialogTitle>
                            <DialogDescription>
                                {restockingIngredient && `Restocking: ${restockingIngredient.description}`}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 p-4">
                            <div>
                                <Label htmlFor="restockAmount">Restock Amount</Label>
                                <Input
                                    id="restockAmount"
                                    type="number"
                                    value={restockAmount}
                                    onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                                    placeholder="Enter amount to add"
                                />
                            </div>
                            <div className="flex gap-2 items-end">
                                <Button onClick={handleConfirmRestock} className="flex-1">Confirm Restock</Button>
                                <Button onClick={() => { setIsRestockDialogOpen(false); setRestockingIngredient(null); setRestockAmount(0); }} variant="outline" className="flex-1">Cancel</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                    <div className="h-122 overflow-y-auto border rounded-md">
                        <Table>
                            <TableHeader className="bg-slate-100">
                                <TableRow>
                                    <TableHead className="font-bold text-slate-900">Code</TableHead>
                                    <TableHead className="font-bold text-slate-900">Description</TableHead>
                                    <TableHead className="font-bold text-slate-900">Cost Price</TableHead>
                                    <TableHead className="font-bold text-slate-900">Stock</TableHead>
                                    <TableHead className="font-bold text-slate-900">Min Stock</TableHead>
                                    <TableHead className="font-bold text-slate-900">Max Stock</TableHead>
                                    <TableHead className="font-bold text-slate-900">Unit</TableHead>
                                    <TableHead className="font-bold text-slate-900">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ingredients.map((ingredient) => (
                                    <TableRow key={ingredient.id} className={isLowStock(ingredient) ? 'bg-red-50' : ''}>
                                        <TableCell className="font-medium">{ingredient.ingr_code}</TableCell>
                                        <TableCell>{ingredient.description}</TableCell>
                                        <TableCell>₱{ingredient.cost_price.toFixed(2)}</TableCell>
                                        <TableCell className={isLowStock(ingredient) ? 'text-red-600 font-bold' : ''}>{ingredient.base_stock_qty}</TableCell>
                                        <TableCell>{ingredient.min_stock_lvl}</TableCell>
                                        <TableCell>{ingredient.max_stock_lvl}</TableCell>
                                        <TableCell>{getUnitDescription(ingredient.usage_unit_id)}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleEditIngredient(ingredient)} size="sm" variant="outline">Edit</Button>
                                                <Button onClick={() => handleRestock(ingredient)} size="sm" variant="outline">Restock</Button>
                                                <Button onClick={() => handleDeleteIngredient(ingredient.id)} size="sm" variant="destructive">Delete</Button>
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

function RecipesTab({ products, ingredients, units, loadInventoryData }: { products: any[], ingredients: any[], units: UnitMasterResponse[], loadInventoryData: () => Promise<void> }) {
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [recipes, setRecipes] = useState<ProductsRecipeResponse[]>([]);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [bulkLines, setBulkLines] = useState<BulkRecipeLine[]>([]);

    const loadRecipes = async (productId: number) => {
        const recipeData = await getProductRecipe(productId);
        setRecipes(recipeData);
    };

    const handleProductChange = (productId: string) => {
        const id = parseInt(productId);
        setSelectedProductId(id);
        loadRecipes(id);
    };

    const handleOpenBulkBuilder = () => {
        if (!selectedProductId) return;
        const lines: BulkRecipeLine[] = recipes.map(r => ({
            id: r.id,
            ingredient_id: r.ingredient_id,
            usage_qty: r.usage_qty,
            usage_uom_code: r.usage_uom_code,
            cost: r.cost,
            isNew: false,
            isDeleted: false,
        }));
        setBulkLines(lines);
        setIsBulkDialogOpen(true);
    };

    const handleAddBulkLine = () => {
        setBulkLines(prev => [...prev, {
            ingredient_id: 0,
            usage_qty: 0,
            usage_uom_code: '',
            cost: 0,
            isNew: true,
            isDeleted: false,
        }]);
    };

    const handleUpdateBulkLine = (index: number, field: keyof BulkRecipeLine, value: number | string) => {
        setBulkLines(prev => prev.map((line, i) => {
            if (i !== index) return line;
            const updated = { ...line, [field]: value };
            if (field === 'ingredient_id' || field === 'usage_qty') {
                const ingredient = ingredients.find((ing: any) => ing.id === updated.ingredient_id);
                const costPrice = ingredient ? ingredient.cost_price : 0;
                const baseStockQty = ingredient ? (ingredient.base_stock_qty || 1) : 1;
                const unitCost = baseStockQty > 0 ? costPrice / baseStockQty : costPrice;
                updated.cost = updated.usage_qty * unitCost;
            }
            return updated;
        }));
    };

    const handleRemoveBulkLine = (index: number) => {
        setBulkLines(prev => prev.map((line, i) => i === index ? { ...line, isDeleted: true } : line));
    };

    const handleSaveBulk = async () => {
        if (!selectedProductId) return;

        const validLines = bulkLines.filter(line => line.ingredient_id !== 0 && !line.isDeleted);
        if (validLines.length === 0) {
            toast.error('Please add at least one valid recipe line');
            return;
        }

        try {
            const result = await saveRecipeBulk(selectedProductId, bulkLines);
            setRecipes(result);
            setIsBulkDialogOpen(false);
            setBulkLines([]);
            toast.success('Recipe saved successfully');
            loadInventoryData();
        } catch (error) {
            toast.error('Failed to save recipe');
            console.error(error);
        }
    };

    const handleRecalculateCost = async () => {
        if (!selectedProductId) return;
        try {
            const cost = await recalculateProductCost(selectedProductId);
            toast.success(`Recipe cost recalculated: ₱${cost.toFixed(2)}`);
            loadInventoryData();
        } catch (error) {
            toast.error('Failed to recalculate cost');
            console.error(error);
        }
    };

    const handleUpdatePrice = async () => {
        if (!selectedProductId) return;
        try {
            const price = await updateProductPriceFromCost(selectedProductId);
            toast.success(`Product price updated: ₱${price.toFixed(2)}`);
            loadInventoryData();
        } catch (error) {
            toast.error('Failed to update price');
            console.error(error);
        }
    };

    const getIngredientName = (ingredientId: number) => {
        const ingredient = ingredients.find(i => i.id === ingredientId);
        return ingredient ? ingredient.description : 'Unknown';
    };

    const getUnitDescription = (unitCode: string) => {
        const unit = units.find(u => u.unit_code === unitCode);
        return unit ? unit.unit_description : unitCode;
    };

    const activeLines = bulkLines.filter(line => !line.isDeleted);

    return (
        <Card>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="productSelect">Select Product</Label>
                            <select
                                id="productSelect"
                                className="w-full mt-1 p-2 border rounded-md"
                                value={selectedProductId || ''}
                                onChange={(e) => handleProductChange(e.target.value)}
                            >
                                <option value="">-- Select Product --</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedProductId && (
                            <div className="flex items-end justify-between">
                                <div className='space-x-2'>
                                    <Button onClick={handleRecalculateCost} variant="outline">Recalculate Cost</Button>
                                    <Button onClick={handleUpdatePrice} variant="outline">Update Price</Button>
                                </div>
                                <Button onClick={handleOpenBulkBuilder}>Edit Recipe</Button>
                            </div>
                        )}
                    </div>

                    {selectedProductId && (
                        <div className="h-121 overflow-y-auto border rounded-md">
                            <Table>
                                <TableHeader className="bg-slate-100">
                                    <TableRow>
                                        <TableHead className="font-bold text-slate-900">Ingredient</TableHead>
                                        <TableHead className="font-bold text-slate-900">Usage Qty</TableHead>
                                        <TableHead className="font-bold text-slate-900">Unit</TableHead>
                                        <TableHead className="font-bold text-slate-900">Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recipes.map((recipe) => (
                                        <TableRow key={recipe.id}>
                                            <TableCell className="font-medium">{getIngredientName(recipe.ingredient_id)}</TableCell>
                                            <TableCell>{recipe.usage_qty}</TableCell>
                                            <TableCell>{getUnitDescription(recipe.usage_uom_code)}</TableCell>
                                            <TableCell>₱{recipe.cost.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {recipes.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                No recipe ingredients found for this product
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                        <DialogContent className="!w-[95vw] !max-w-none max-h-[vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Recipe</DialogTitle>
                                <DialogDescription>
                                    Add, edit, or remove ingredients for this product. Save all changes at once.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="overflow-x-auto h-[400px] border rounded-md">
                                    <Table>
                                        <TableHeader className="bg-slate-100">
                                            <TableRow>
                                                <TableHead className="font-bold text-slate-900">Ingredient</TableHead>
                                                <TableHead className="font-bold text-slate-900">Usage Qty</TableHead>
                                                <TableHead className="font-bold text-slate-900">Unit</TableHead>
                                                <TableHead className="font-bold text-slate-900">Cost</TableHead>
                                                <TableHead className="font-bold text-slate-900 w-24"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activeLines.map((line, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <select
                                                            className="w-full p-1 border rounded text-sm"
                                                            value={line.ingredient_id}
                                                            onChange={(e) => handleUpdateBulkLine(index, 'ingredient_id', parseInt(e.target.value))}
                                                        >
                                                            <option value="0">-- Select --</option>
                                                            {ingredients.map((ing) => (
                                                                <option key={ing.id} value={ing.id}>{ing.description}</option>
                                                            ))}
                                                        </select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            className="w-24"
                                                            value={line.usage_qty}
                                                            onChange={(e) => handleUpdateBulkLine(index, 'usage_qty', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <select
                                                            className="w-full p-1 border rounded text-sm"
                                                            value={line.usage_uom_code}
                                                            onChange={(e) => handleUpdateBulkLine(index, 'usage_uom_code', e.target.value)}
                                                        >
                                                            <option value="">-- Select --</option>
                                                            {units.map((unit) => (
                                                                <option key={unit.id} value={unit.unit_code}>{unit.unit_description}</option>
                                                            ))}
                                                        </select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm font-medium">₱{line.cost.toFixed(2)}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button onClick={() => handleRemoveBulkLine(index)} size="sm" variant="destructive">Remove</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {activeLines.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                                        No ingredients added. Click "Add Row" to start building the recipe.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                
                                <div className="flex gap-2">
                                    <div className="w-full">
                                        <Button onClick={handleAddBulkLine} variant="outline" className="w-80">Add Row</Button>
                                    </div>
                                    <Button onClick={handleSaveBulk} className="flex-1">Save Recipe</Button>
                                    <Button onClick={() => { setIsBulkDialogOpen(false); setBulkLines([]); }} variant="outline" className="flex-1">Cancel</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}

function ConversionsTab({ conversions, loadInventoryData }: { conversions: any[], loadInventoryData: () => Promise<void> }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Unit Conversions</CardTitle>
                <CardDescription>Manage unit conversion rates</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Unit Conversions</h3>
                </div>
                <div className="h-135 overflow-y-auto border rounded-md">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="font-bold text-slate-900">From</TableHead>
                                <TableHead className="font-bold text-slate-900">To</TableHead>
                                <TableHead className="font-bold text-slate-900">Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {conversions.map((conversion) => (
                                <TableRow key={conversion.id}>
                                    <TableCell className="font-medium">{conversion.unit_to_convert}</TableCell>
                                    <TableCell>{conversion.convert_to}</TableCell>
                                    <TableCell>{conversion.rate}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
