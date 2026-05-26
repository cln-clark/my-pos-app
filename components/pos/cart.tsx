'use client';

import { usePOS } from '@/lib/context';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Minus, Plus, Check } from 'lucide-react';

interface CartPanelProps {
    selectedItemId: string | null;
    onSelectItem: (id: string | null) => void;
}

export function CartPanel({ selectedItemId, onSelectItem }: CartPanelProps) {

    const { cart, updateCartQuantity, updateDiscountQty, removeFromCart, getCartTotal, discountCodes } = usePOS();
    const total = getCartTotal()



    return(
        <Card className='flex flex-col flex-1 min-h-0'>
            <CardContent className="flex flex-col gap-1 p-1">
                <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 min-h-0 pr-1">
                    { cart.length == 0  ? (
                        <p className='text-xs text-muted-foreground text-center py-8'>
                            No current order
                        </p>
                    ) : (
                        cart.map((item) => {
                            const isSelected = selectedItemId === item.product.id;
                            const hasDiscount = item.discountCodeId !== undefined && item.discountQty > 0;
                            const discount = hasDiscount ? discountCodes.find(d => d.id === item.discountCodeId) : null;

                            return (
                                <div key={ item.product.id }
                                     onClick={() => onSelectItem(isSelected ? null : item.product.id)}
                                     className={`flex items-center gap-2 p-1.5 rounded border shrink-0 cursor-pointer transition-colors ${
                                        hasDiscount ? 'bg-green-50 ring-1 ring-green-300 ring-inset' : 'bg-slate-50 border-slate-200'
                                     } ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                                >
                                    <div className='flex-1 min-w-0'>
                                        <p className='font-medium text-xs truncate'>{ item.product.name}</p>
                                        <p className='text-xs text-muted-foreground'>₱{item.product.price.toFixed(2)}</p>
                                        {hasDiscount && (
                                            <p className='text-xs text-green-600 font-medium flex items-center gap-1'>
                                                Disc: <Check className='h-3 w-3' /> {discount?.name} ({item.discountQty}/{item.quantity})
                                            </p>
                                        )}
                                    </div>
                                    <div className='flex items-center gap-1 shrink-0' onClick={(e) => e.stopPropagation()}>
                                        <Button variant='outline'
                                                size='default'
                                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                                className="h-8 w-8 active:scale-95 transition-transform">
                                            <Minus className='h-3 w-3'></Minus>
                                        </Button>
                                        <Input type='number'
                                                min="1"
                                                value={ item.quantity}
                                                onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value)) }
                                                className="h-8 w-10 text-center text-xs p-0">
                                        </Input>
                                        <Button variant='outline'
                                                size='default'
                                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                                className="h-8 w-8 active:scale-95 transition-transform">
                                            <Plus className='h-3 w-3'></Plus>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    )
}