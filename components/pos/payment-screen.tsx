"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PaymentMethodSelector, PaymentMethod } from "./payment-method-selector"
import { Check } from "lucide-react"
import { usePOS } from "@/lib/context"

interface PaymentScreenProps {
    total: number
    items: Array<{
        product: { id: string; name: string; price: number }
        quantity: number
        discountQty: number
        discountCode?: number
    }>
    onPaymentComplete: (method: PaymentMethod, change: number) => void
    onCancel: () => void
}

export function PaymentScreen({ total, items, onPaymentComplete, onCancel }: PaymentScreenProps) {

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
    const [amountTendered, setAmountTendered] = useState<string>('')
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const parsedAmount = parseFloat(amountTendered) || 0;
    const change = paymentMethod === 'cash'
        ? Math.round((parsedAmount - total) * 100) / 100
        : 0;

    const { discountCodes } = usePOS();

    const handleConfirm = () => {
        const amount = parseFloat(amountTendered);
        if (paymentMethod === 'cash' && Math.round(amount * 100) < Math.round(total * 100)) {
            alert('Insufficient amount tendered');
            return;
        }
        setConfirmDialogOpen(true);
    };

    const handleFinalConfirm = () => {
        const amount = parseFloat(amountTendered);
        const change = Math.round((amount - total) * 100) / 100;
        setConfirmDialogOpen(false);
        onPaymentComplete(paymentMethod, change);
    };

    return (
        <div className="flex flex-col h-full min-h-0 gap-4">
            {/* Grid Layout - Similar to Cashier Page */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 min-h-0">
                {/* Left - Order Items (3 columns) */}
                <div className="lg:col-span-3 flex flex-col min-h-0">
                    <Card className="flex-1 min-h-0 flex flex-col">
                        <CardHeader className="shrink-0 pb-2 px-3">
                            <CardTitle className="text-base font-bold">Order Items</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-2 space-y-2">
                            {items.map((item) => {
                                const hasDiscount = item.discountCode !== undefined && item.discountQty > 0;
                                const discount = hasDiscount ? discountCodes.find(d => d.id === item.discountCode) : null;

                                return (
                                    <div key={item.product.id} className={`flex justify-between items-center p-2 rounded border ${hasDiscount ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{item.product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.quantity} x ₱{item.product.price.toFixed(2)}
                                            </p>
                                            {hasDiscount && (
                                                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                    Disc: <Check className='h-3 w-3' /> {discount?.name} ({item.discountQty}/{item.quantity})
                                                </p>
                                            )}
                                        </div>
                                        <p className="font-semibold text-base ml-2">₱{(item.product.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Right - Payment Controls (2 columns) */}
                <div className="lg:col-span-2 flex flex-col min-h-0 min-w-[320px]">
                    <div className="flex flex-col h-full gap-3">
                        {/* Payment Method Selector */}
                        <PaymentMethodSelector
                            selectedMethod={paymentMethod}
                            onMethodChange={setPaymentMethod}
                        />

                        {/* Cash Payment Input and Summary */}
                        {paymentMethod === 'cash' && (
                            <Card>
                                <CardHeader className="space-y-1 pb-3">
                                    <CardTitle className="text-base font-bold">Cash Payment</CardTitle>
                                    <CardDescription className="text-sm">Enter amount tendered</CardDescription>
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
                                            className="flex-1 h-12 text-lg"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setAmountTendered(total.toFixed(2))}
                                            className="font-bold shrink-0 h-12 px-4 text-sm active:scale-95 transition-transform"
                                        >
                                            Exact
                                        </Button>
                                    </div>
                                    {amountTendered && (
                                        <div className="space-y-2 pt-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground font-medium">Tendered:</span>
                                                <span>₱{parsedAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground font-medium">Change:</span>
                                                <span className={`font-semibold text-base ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    ₱{change.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-base pt-2">
                                        <span>Total:</span>
                                        <span className="text-blue-600">₱{total.toFixed(2)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Card Payment Summary */}
                        {paymentMethod === 'card' && (
                            <Card>
                                <CardContent className="p-3">
                                    <div className="flex justify-between font-bold text-base">
                                        <span>Total:</span>
                                        <span className="text-blue-600">₱{total.toFixed(2)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 shrink-0">
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                className="flex-1 h-12 text-base font-semibold active:scale-95 transition-transform"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={paymentMethod === 'cash' && (
                                            !amountTendered ||
                                            Math.round(parseFloat(amountTendered) * 100) < Math.round(total * 100)
                                        )}
                                className="flex-1 h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform"
                            >
                                {paymentMethod === 'card' ? 'Pay with Card' : 'Finish Transaction'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Transaction</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to finish this transaction?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Payment Method:</span>
                            <span className="font-medium capitalize">{paymentMethod}</span>
                        </div>
                        {paymentMethod === 'cash' && (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Amount Tendered:</span>
                                    <span className="font-medium">₱{parsedAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Change:</span>
                                    <span className="font-medium">₱{change.toFixed(2)}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between text-sm pt-2 border-t">
                            <span className="text-muted-foreground font-medium">Total:</span>
                            <span className="font-bold text-lg text-blue-600">₱{total.toFixed(2)}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDialogOpen(false)}
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleFinalConfirm}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
