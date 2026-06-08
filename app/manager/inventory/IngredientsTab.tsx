'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UnitMasterResponse, CreateIngredientRequest, UpdateIngredientRequest, UpdateIngredientStockRequest, CsvIngredientRow } from '@/lib/types';
import { createIngredient, updateIngredient, deleteIngredient, updateIngredientStock, batchImportIngredients } from '@/lib/data';
import { toast } from 'sonner';

interface IngredientsTabProps {
    ingredients: any[];
    units: UnitMasterResponse[];
    loadInventoryData: () => Promise<void>;
}

export default function IngredientsTab({ ingredients, units, loadInventoryData }: IngredientsTabProps) {
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

    const toTitleCase = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

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

    const handleCsvUploadIngredients = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
            const requiredHeaders = ['description', 'total_cost'];

            if (!requiredHeaders.every(h => headers.includes(h))) {
                toast.error('CSV must have at minimum: description, total_cost');
                setIsUploading(false);
                return;
            }

            const csvIngredients: CsvIngredientRow[] = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length < 3) continue;

                const totalCost = parseFloat(values[2]);
                const baseStockQty = values[3] ? parseInt(values[3]) || 0 : 0;

                if (isNaN(totalCost) || totalCost <= 0) {
                    toast.error(`Row ${i + 1}: Invalid total_cost value`);
                    continue;
                }

                if (baseStockQty <= 0) {
                    toast.error(`Row ${i + 1}: Invalid base_stock_qty value (must be > 0)`);
                    continue;
                }

                csvIngredients.push({
                    ingr_code: values[0] || '',
                    description: values[1],
                    total_cost: totalCost,
                    base_stock_qty: baseStockQty,
                    unit_code: values[4] || '',
                    min_stock_lvl: values[5] ? parseInt(values[5]) || 0 : 0,
                    max_stock_lvl: values[6] ? parseInt(values[6]) || 0 : 0,
                    last_cost: values[7] ? parseFloat(values[7]) || 0 : 0,
                    preferred_unit_type: values[8] || '',
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
                            onChange={handleCsvUploadIngredients}
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
                                    onChange={(e) => setFormData({ ...formData, description: toTitleCase(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="costPrice">Cost Price</Label>
                                <Input
                                    id="costPrice"
                                    type="number"
                                    step="0.01"
                                    value={formData.cost_price || ''}
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
                                    value={formData.min_stock_lvl || ''}
                                    onChange={(e) => setFormData({ ...formData, min_stock_lvl: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="maxStock">Max Stock</Label>
                                <Input
                                    id="maxStock"
                                    type="number"
                                    value={formData.max_stock_lvl || ''}
                                    onChange={(e) => setFormData({ ...formData, max_stock_lvl: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="baseStock">Base Stock</Label>
                                <Input
                                    id="baseStock"
                                    type="number"
                                    value={formData.base_stock_qty || ''}
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
                                    value={restockAmount || ''}
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
                                    <TableHead className="font-bold text-slate-900">Last Cost</TableHead>
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
                                        <TableCell>₱{ingredient.last_cost.toFixed(2)}</TableCell>
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
