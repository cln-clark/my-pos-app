"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PaymentMethodSelector, PaymentMethod } from "./payment-method-selector"

interface PaymentScreenProps {
    total: number
    items: Array<{
        product: { id: string; name: string; price: number }
        quantity: number
    }>
    onPaymentComplete: (method: PaymentMethod, change: number) => void
    onCancel: () => void
}

export function PaymentScreen({ total, items, onPaymentComplete, onCancel }: PaymentScreenProps) {
    
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
    const [amountTendered, setAmountTendered] = useState<string>('')
    const parsedAmount = parseFloat(amountTendered) || 0;
    const change = paymentMethod === 'cash' 
        ? Math.round((parsedAmount - total) * 100) / 100 
        : 0;

    const handleConfirm = () => {
        const amount = parseFloat(amountTendered);
        if (paymentMethod === 'cash' && Math.round(amount * 100) < Math.round(total * 100)) {
            alert('Insufficient amount tendered');
            return;
        }
        const change = Math.round((amount - total) * 100) / 100;
        onPaymentComplete(paymentMethod, change);
    };

    return (
        <div className="flex flex-col gap-6 h-full min-h-0 overflow-hidden">
            {/* Order Summary */}
            <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <CardHeader className="shrink-0 space-y-1">
                    <CardTitle className="text-2xl font-bold">Order Summary</CardTitle>
                    <CardDescription>Review order before payment</CardDescription>
                </CardHeader>
               <CardContent className="flex gap-6 min-h-0 overflow-hidden">
    
                    {/* Left — Items List (scrollable) */}
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {items.map((item) => (
                            <div key={item.product.id} className="flex justify-between items-center py-2 border-b">
                                <div>
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.quantity} x ₱{item.product.price.toFixed(2)}
                                    </p>
                                </div>
                                <p className="font-semibold">₱{(item.product.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Right — Total Summary (fixed, never scrolls) */}
                    <div className="w-56 shrink-0 border-l pl-6 flex flex-col justify-end gap-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₱{total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax (7.5%)</span>
                            <span>₱{(total * 0.075).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-3">
                            <span>Total</span>
                            <span className="text-blue-600">₱{(total * 1.075).toFixed(2)}</span>
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* Payment Method and Amount */}
            <div className="grid grid-cols-2 gap-4 shrink-0">
                <PaymentMethodSelector
                    selectedMethod={paymentMethod}
                    onMethodChange={setPaymentMethod}
                />

                {paymentMethod === 'cash' && (
                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-lg font-semibold">Cash Payment</CardTitle>
                            <CardDescription>Enter amount tendered</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={amountTendered}
                                    onChange={(e) => setAmountTendered(e.target.value)}
                                    placeholder="Enter amount"
                                    step="0.01"
                                    min={total}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setAmountTendered(total.toFixed(2))}
                                    className="shrink-0"
                                >
                                    Exact
                                </Button>
                            </div>
                            {amountTendered && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Change:</span>
                                    <span className={`font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ₱{change.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 shrink-0">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 h-14 text-lg"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    disabled={paymentMethod === 'cash' && (
                                        !amountTendered || 
                                        Math.round(parseFloat(amountTendered) * 100) < Math.round(total * 100)
                                    )}
                    className="flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700"
                >
                    Confirm Payment
                </Button>
            </div>
        </div>
    )
}
