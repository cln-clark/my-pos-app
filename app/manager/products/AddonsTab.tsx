'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from 'lucide-react';
import { AddOnResponse, AddOnItemResponse, CreateAddOnRequest, UpdateAddOnRequest, AddAddOnItemRequest } from '@/lib/types';
import { getAddOns, getAddOnWithItems, createAddOn, updateAddOn, deleteAddOn, addAddOnItem, removeAddOnItem, updateAddOnItem } from '@/lib/data';
import { toast } from 'sonner';

interface AddonsTabProps {
    products: any[];
    loadInventoryData: () => Promise<void>;
}

export default function AddonsTab({ products, loadInventoryData }: AddonsTabProps) {
    const [addOns, setAddOns] = useState<AddOnResponse[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingAddOn, setEditingAddOn] = useState<AddOnResponse | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
    const [selectedAddOn, setSelectedAddOn] = useState<AddOnResponse | null>(null);
    const [addOnItems, setAddOnItems] = useState<AddOnItemResponse[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
    });
    const [newItem, setNewItem] = useState({ product_id: 0, quantity: 1 });

    const toTitleCase = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        loadAddOns();
    }, []);

    const loadAddOns = async () => {
        const data = await getAddOns();
        setAddOns(data);
    };

    const handleAddAddOn = async () => {
        setIsAdding(true);
        setEditingAddOn(null);
        setFormData({ name: '', description: '', price: 0 });
        setIsDialogOpen(true);
    };

    const handleSaveAddOn = async () => {
        if (!formData.name || formData.price <= 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingAddOn) {
                const data: UpdateAddOnRequest = {
                    id: editingAddOn.id,
                    name: formData.name,
                    description: formData.description,
                    price: formData.price,
                    is_active: editingAddOn.is_active,
                };
                await updateAddOn(data);
                toast.success('Add-on updated successfully');
            } else {
                const data: CreateAddOnRequest = {
                    name: formData.name,
                    description: formData.description,
                    price: formData.price,
                };
                await createAddOn(data);
                toast.success('Add-on added successfully');
            }

            setFormData({ name: '', description: '', price: 0 });
            setIsAdding(false);
            setEditingAddOn(null);
            setIsDialogOpen(false);
            loadAddOns();
        } catch (error) {
            toast.error(editingAddOn ? 'Failed to update add-on' : 'Failed to add add-on');
            console.error(error);
        }
    };

    const handleEditAddOn = async (addOn: AddOnResponse) => {
        setEditingAddOn(addOn);
        setFormData({
            name: addOn.name,
            description: addOn.description || '',
            price: addOn.price,
        });
        setIsAdding(false);
        setIsDialogOpen(true);
    };

    const handleDeleteAddOn = async (addOnId: number) => {
        if (!confirm('Are you sure you want to delete this add-on?')) return;

        try {
            await deleteAddOn(addOnId);
            toast.success('Add-on deleted successfully');
            loadAddOns();
        } catch (error) {
            toast.error('Failed to delete add-on');
            console.error(error);
        }
    };

    const handleManageItems = async (addOn: AddOnResponse) => {
        setSelectedAddOn(addOn);
        const [_, items] = await getAddOnWithItems(addOn.id);
        setAddOnItems(items);
        setNewItem({ product_id: 0, quantity: 1 });
        setIsItemsDialogOpen(true);
    };

    const handleAddItem = async () => {
        if (!selectedAddOn || newItem.product_id === 0) {
            toast.error('Please select a product');
            return;
        }

        try {
            const data: AddAddOnItemRequest = {
                add_on_id: selectedAddOn.id,
                product_id: newItem.product_id,
                quantity: newItem.quantity,
            };
            await addAddOnItem(data);
            toast.success('Item added to add-on');
            const [_, items] = await getAddOnWithItems(selectedAddOn.id);
            setAddOnItems(items);
            setNewItem({ product_id: 0, quantity: 1 });
        } catch (error) {
            toast.error('Failed to add item to add-on');
            console.error(error);
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        try {
            await removeAddOnItem(itemId);
            toast.success('Item removed from add-on');
            if (selectedAddOn) {
                const [_, items] = await getAddOnWithItems(selectedAddOn.id);
                setAddOnItems(items);
            }
        } catch (error) {
            toast.error('Failed to remove item from add-on');
            console.error(error);
        }
    };

    const handleUpdateItemQuantity = async (itemId: number, quantity: number) => {
        try {
            await updateAddOnItem(itemId, quantity);
            toast.success('Item quantity updated');
        } catch (error) {
            toast.error('Failed to update item quantity');
            console.error(error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Add-ons</CardTitle>
                        <CardDescription>Manage product add-ons</CardDescription>
                    </div>
                    <Button onClick={handleAddAddOn}>Add Add-on</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-96 overflow-y-auto border rounded-md">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="font-bold text-slate-900">Name</TableHead>
                                <TableHead className="font-bold text-slate-900">Description</TableHead>
                                <TableHead className="font-bold text-slate-900">Price</TableHead>
                                <TableHead className="font-bold text-slate-900">Status</TableHead>
                                <TableHead className="font-bold text-slate-900">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {addOns.map((addOn) => (
                                <TableRow key={addOn.id}>
                                    <TableCell className="font-medium">{addOn.name}</TableCell>
                                    <TableCell>{addOn.description || '-'}</TableCell>
                                    <TableCell>₱{addOn.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${addOn.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {addOn.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleManageItems(addOn)} size="sm" variant="outline">Items</Button>
                                            <Button onClick={() => handleEditAddOn(addOn)} size="sm" variant="outline">Edit</Button>
                                            <Button onClick={() => handleDeleteAddOn(addOn.id)} size="sm" variant="destructive">Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Add/Edit Add-on Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="!w-[50vw] !max-w-[50vw] scrollbar-hide">
                        <DialogHeader>
                            <DialogTitle>{editingAddOn ? 'Edit Add-on' : 'Add Add-on'}</DialogTitle>
                            <DialogDescription>
                                {editingAddOn ? 'Update the add-on details below.' : 'Fill in the details to add a new add-on.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: toTitleCase(e.target.value) })}
                                    placeholder="Add-on name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Add-on description"
                                />
                            </div>
                            <div>
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price || ''}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSaveAddOn} className="flex-1">
                                {editingAddOn ? 'Update' : 'Add'}
                            </Button>
                            <Button onClick={() => { setIsDialogOpen(false); setIsAdding(false); setEditingAddOn(null); setFormData({ name: '', description: '', price: 0 }); }} variant="outline" className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Manage Items Dialog */}
                <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
                    <DialogContent className="!w-[60vw] !max-w-[60vw] !max-h-[80vh] overflow-y-auto scrollbar-hide">
                        <DialogHeader>
                            <DialogTitle>Manage Add-on Items - {selectedAddOn?.name}</DialogTitle>
                            <DialogDescription>Add or remove products from this add-on.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <Label htmlFor="product">Product</Label>
                                    <Select value={newItem.product_id.toString()} onValueChange={(value) => setNewItem({ ...newItem, product_id: parseInt(value) })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((product) => (
                                                <SelectItem key={product.id} value={product.id.toString()}>
                                                    {product.sku} - {product.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={newItem.quantity}
                                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                                        min="1"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={handleAddItem} className="w-full">Add Item</Button>
                                </div>
                            </div>

                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {addOnItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.product_name}</TableCell>
                                                <TableCell>{item.product_sku}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                                        className="w-20"
                                                        min="1"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button onClick={() => handleRemoveItem(item.id)} size="sm" variant="destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => { setIsItemsDialogOpen(false); setSelectedAddOn(null); setAddOnItems([]); }} variant="outline" className="flex-1">
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
