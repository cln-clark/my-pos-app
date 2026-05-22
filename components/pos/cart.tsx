'use client';

import { usePOS } from '@/lib/context';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Minus, Plus } from 'lucide-react';

 
export function CartPanel() {

    const { cart, updateCartQuantity, removeFromCart, getCartTotal } = usePOS();
    const subtotal = getCartTotal()
    const tax = subtotal * 0.075
    const total = subtotal + tax
    
    

    return(
        <Card className='flex flex-col flex-1 min-h-0'>
            <CardContent className="flex flex-col gap-4">
                <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 min-h-0 pr-1">
                    { cart.length == 0  ? (
                        <p className='text-sm text-muted-foreground text-center py-8'>
                            No current order
                        </p>
                    ) : (
                        cart.map((item) => (
                            <div key={ item.product.id }
                                 className='flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 shrink-0'
                            >
                                <div className='flex justify-between items-center'>
                                    <p className='font-medium text-sm truncate flex-1'>{ item.product.name}</p>
                                    <p className='text-xs text-muted-foreground'>₱{item.product.price.toFixed(2)} each</p>
                                </div>
                                <div className='flex items-center justify-center gap-2'>
                                    <Button variant='outline'
                                            size='sm'
                                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}>
                                        <Minus className='h-3 w-3'></Minus>
                                    </Button>
                                    <Input type='number'
                                            min="1"
                                            value={ item.quantity}
                                            onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value)) }
                                            className="h-8 w-16 text-center p-0">
                                    </Input>
                                    <Button variant='outline'
                                            size='sm'
                                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}>
                                        <Plus className='h-3 w-3'></Plus>
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}