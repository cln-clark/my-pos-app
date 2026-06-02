'use client';

import { usePOS } from '@/lib/context';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Minus, Plus, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CartPanelProps {
    selectedItemId: string | null;
    onSelectItem: (id: string | null) => void;
}

export function CartPanel({ selectedItemId, onSelectItem }: CartPanelProps) {

    const { cart, updateCartQuantity, updateDiscountQty, removeFromCart, getCartTotal, discountCodes, calculateItemVATBreakdown } = usePOS();
    const total = getCartTotal()
    const [highlightedItems, setHighlightedItems] = useState<Set<string>>(new Set());

    // Remove highlight after 1.5 seconds
    useEffect(() => {
        const newlyAdded = cart.filter(item => item.newlyAdded && Date.now() - item.newlyAdded < 2000);
        if (newlyAdded.length > 0) {
            const newHighlights = new Set(newlyAdded.map(item => item.product.id));
            setHighlightedItems(newHighlights);
            
            const timer = setTimeout(() => {
                setHighlightedItems(new Set());
            }, 1500);
            
            return () => clearTimeout(timer);
        }
    }, [cart]);

    // Add keyframe animation
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
          @keyframes scaleBounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05, 1.05); }
          }
        `;
        document.head.appendChild(style);
        return () => style.remove();
    }, []);



    return(
        <div className="flex flex-col gap-1 flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 min-h-0 pr-1">
                { cart.length == 0  ? (
                    <p className='text-xs text-muted-foreground text-center py-8'>
                        No current order
                    </p>
                ) : (
                    cart.map((item) => {
                        const isSelected = selectedItemId === item.product.id;
                        const hasDiscount = item.discountCode !== undefined && item.discountQty > 0;
                        const discount = hasDiscount ? discountCodes.find(d => d.id === item.discountCode) : null;
                        const vatBreakdown = calculateItemVATBreakdown(item);
                        // For SC/PWD discounts, include Less VAT in the total discount
                        const totalDiscount = vatBreakdown.isScpwdDiscount
                            ? (vatBreakdown.discountAmount || 0) + (vatBreakdown.lessVat || 0)
                            : (vatBreakdown.discountAmount || 0);
                        const discountedPrice = item.product.price - (totalDiscount / item.quantity);

                        return (
                            <div key={ item.product.id }
                                 onClick={() => onSelectItem(isSelected ? null : item.product.id)}
                                 className={`flex items-center gap-2 p-1.5 rounded border shrink-0 cursor-pointer transition-all ${
                                    highlightedItems.has(item.product.id) ? 'ring-1 ring-blue-200 ring-inset' : ''
                                 } ${hasDiscount ? 'bg-green-50 ring-1 ring-green-300 ring-inset' : 'bg-slate-50 border-slate-300'
                                 } ${isSelected ? 'ring-2 ring-green-500 ring-inset' : ''}`}
                                 style={highlightedItems.has(item.product.id) ? {
                                   animation: 'scaleBounce 0.3s ease-in-out'
                                 } : undefined}
                            >
                                <div className='flex-1 min-w-0'>
                                    <p className='font-medium text-xs truncate'>{ item.product.name}</p>
                                    {hasDiscount ? (
                                        <>
                                            <p className='text-xs text-green-600 font-medium'>
                                                ₱{discountedPrice.toFixed(2)} <span className='text-muted-foreground line-through text-xs'>₱{item.product.price.toFixed(2)}</span>
                                            </p>
                                            <p className='text-xs text-green-600 font-medium flex items-center gap-1'>
                                                Disc: <Check className='h-3 w-3' /> {discount?.name} ({item.discountQty}/{item.quantity})
                                            </p>
                                        </>
                                    ) : (
                                        <p className='text-xs text-muted-foreground'>₱{item.product.price.toFixed(2)}</p>
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
        </div>
    )
}