'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateCategoryRequest, UpdateCategoryRequest } from '@/lib/types';
import { createCategory, updateCategory, deleteCategory } from '@/lib/data';
import { toast } from 'sonner';

interface CategoriesTabProps {
    categories: any[];
    loadInventoryData: () => Promise<void>;
}

export default function CategoriesTab({ categories, loadInventoryData }: CategoriesTabProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        category_code: '',
        category_name: '',
    });

    const toTitleCase = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

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
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('already exists')) {
                toast.error(errorMessage);
            } else {
                toast.error(editingCategory ? 'Failed to update category' : 'Failed to add category');
            }
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
        <Card className='rounded-md pt-4'>
            <CardHeader className='flex items-center justify-between'>
                <div>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>Manage product categories</CardDescription>
                </div>
                <Button onClick={handleAddCategory}
                        className='rounded-md'>Add Category</Button>
            </CardHeader>
            <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide">
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
                                    onChange={(e) => setFormData({ ...formData, category_name: toTitleCase(e.target.value) })}
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

                <div className="h-125 overflow-y-auto border rounded-md">
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
