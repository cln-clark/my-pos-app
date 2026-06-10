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
import { BundleResponse, BundleItemResponse, CreateBundleRequest, UpdateBundleRequest, AddBundleItemRequest } from '@/lib/types';
import { getBundles, getBundleWithItems, createBundle, updateBundle, deleteBundle, addBundleItem, removeBundleItem, updateBundleItem } from '@/lib/data';
import { toast } from 'sonner';

interface BundleTabProps {
    products: any[];
    loadInventoryData: () => Promise<void>;
}

export default function BundleTab({ products, loadInventoryData }: BundleTabProps) {
    const [bundles, setBundles] = useState<BundleResponse[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingBundle, setEditingBundle] = useState<BundleResponse | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
    const [selectedBundle, setSelectedBundle] = useState<BundleResponse | null>(null);
    const [bundleItems, setBundleItems] = useState<BundleItemResponse[]>([]);
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
        loadBundles();
    }, []);

    const loadBundles = async () => {
        const data = await getBundles();
        setBundles(data);
    };

    const handleAddBundle = async () => {
        setIsAdding(true);
        setEditingBundle(null);
        setFormData({ name: '', description: '', price: 0 });
        setIsDialogOpen(true);
    };

    const handleSaveBundle = async () => {
        if (!formData.name || formData.price <= 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingBundle) {
                const data: UpdateBundleRequest = {
                    id: editingBundle.id,
                    name: formData.name,
                    description: formData.description,
                    price: formData.price,
                    is_active: editingBundle.is_active,
                };
                await updateBundle(data);
                toast.success('Bundle updated successfully');
            } else {
                const data: CreateBundleRequest = {
                    name: formData.name,
                    description: formData.description,
                    price: formData.price,
                };
                await createBundle(data);
                toast.success('Bundle added successfully');
            }

            setFormData({ name: '', description: '', price: 0 });
            setIsAdding(false);
            setEditingBundle(null);
            setIsDialogOpen(false);
            loadBundles();
        } catch (error) {
            toast.error(editingBundle ? 'Failed to update bundle' : 'Failed to add bundle');
            console.error(error);
        }
    };

    const handleEditBundle = async (bundle: BundleResponse) => {
        setEditingBundle(bundle);
        setFormData({
            name: bundle.name,
            description: bundle.description || '',
            price: bundle.price,
        });
        setIsAdding(false);
        setIsDialogOpen(true);
    };

    const handleDeleteBundle = async (bundleId: number) => {
        if (!confirm('Are you sure you want to delete this bundle?')) return;

        try {
            await deleteBundle(bundleId);
            toast.success('Bundle deleted successfully');
            loadBundles();
        } catch (error) {
            toast.error('Failed to delete bundle');
            console.error(error);
        }
    };

    const handleManageItems = async (bundle: BundleResponse) => {
        setSelectedBundle(bundle);
        const [_, items] = await getBundleWithItems(bundle.id);
        setBundleItems(items);
        setNewItem({ product_id: 0, quantity: 1 });
        setIsItemsDialogOpen(true);
    };

    const handleAddItem = async () => {
        if (!selectedBundle || newItem.product_id === 0) {
            toast.error('Please select a product');
            return;
        }

        try {
            const data: AddBundleItemRequest = {
                bundle_id: selectedBundle.id,
                product_id: newItem.product_id,
                quantity: newItem.quantity,
            };
            await addBundleItem(data);
            toast.success('Item added to bundle');
            const [_, items] = await getBundleWithItems(selectedBundle.id);
            setBundleItems(items);
            setNewItem({ product_id: 0, quantity: 1 });
        } catch (error) {
            toast.error('Failed to add item to bundle');
            console.error(error);
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        try {
            await removeBundleItem(itemId);
            toast.success('Item removed from bundle');
            if (selectedBundle) {
                const [_, items] = await getBundleWithItems(selectedBundle.id);
                setBundleItems(items);
            }
        } catch (error) {
            toast.error('Failed to remove item from bundle');
            console.error(error);
        }
    };

    const handleUpdateItemQuantity = async (itemId: number, quantity: number) => {
        try {
            await updateBundleItem(itemId, quantity);
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
                        <CardTitle>Bundles</CardTitle>
                        <CardDescription>Manage product bundles</CardDescription>
                    </div>
                    <Button onClick={handleAddBundle}>Add Bundle</Button>
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
                            {bundles.map((bundle) => (
                                <TableRow key={bundle.id}>
                                    <TableCell className="font-medium">{bundle.name}</TableCell>
                                    <TableCell>{bundle.description || '-'}</TableCell>
                                    <TableCell>₱{bundle.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${bundle.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {bundle.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleManageItems(bundle)} size="sm" variant="outline">Items</Button>
                                            <Button onClick={() => handleEditBundle(bundle)} size="sm" variant="outline">Edit</Button>
                                            <Button onClick={() => handleDeleteBundle(bundle.id)} size="sm" variant="destructive">Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Add/Edit Bundle Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="!w-[50vw] !max-w-[50vw] scrollbar-hide">
                        <DialogHeader>
                            <DialogTitle>{editingBundle ? 'Edit Bundle' : 'Add Bundle'}</DialogTitle>
                            <DialogDescription>
                                {editingBundle ? 'Update the bundle details below.' : 'Fill in the details to add a new bundle.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: toTitleCase(e.target.value) })}
                                    placeholder="Bundle name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Bundle description"
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
                            <Button onClick={handleSaveBundle} className="flex-1">
                                {editingBundle ? 'Update' : 'Add'}
                            </Button>
                            <Button onClick={() => { setIsDialogOpen(false); setIsAdding(false); setEditingBundle(null); setFormData({ name: '', description: '', price: 0 }); }} variant="outline" className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Manage Items Dialog */}
                <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
                    <DialogContent className="!w-[60vw] !max-w-[60vw] !max-h-[80vh] overflow-y-auto scrollbar-hide">
                        <DialogHeader>
                            <DialogTitle>Manage Bundle Items - {selectedBundle?.name}</DialogTitle>
                            <DialogDescription>Add or remove products from this bundle.</DialogDescription>
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
                                        {bundleItems.map((item) => (
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
                            <Button onClick={() => { setIsItemsDialogOpen(false); setSelectedBundle(null); setBundleItems([]); }} variant="outline" className="flex-1">
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
