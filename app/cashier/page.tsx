        'use client';

import { AppLayout } from "@/components/layout/app-layout";
import { CartPanel } from "@/components/pos/cart";
import { ProductGrid} from "@/components/pos/product-grid";
import { Button } from "@/components/ui/button";
import { usePOS} from "@/lib/context";
import { PaymentMethod, TxnMode } from "@/lib/types";
import { PaymentScreen } from "@/components/pos/payment-screen";
import { TxnModeSelector } from "@/components/pos/txn-mode-selector";
import { generateReceiptText } from "@/lib/receipt";
import { useState } from "react";

export default function CashierPage() {

    const { currentUser, cart, getCartTotal, clearCart, createTransaction } = usePOS();
    const [ paymentOpen, setPaymentOpen ]  = useState(false)
    const [ txnMode, setTxnMode ] = useState<TxnMode>('dine-in')
    const total = getCartTotal();
    const tax = total * 0.075;

    const handlePaymentComplete = async (method: PaymentMethod, change: number) => {
        const transaction = await createTransaction({
            cashierUserCode: currentUser!.id,
            cashierName: currentUser!.name,
            timestamp: new Date(),
            items: cart,
            subtotal: total,
            tax: tax,
            total: total + tax,
            paymentMethod: method,
            change: method === 'cash' ? change : undefined,
            txnMode: txnMode,
        });

        // Generate receipt text
        const receiptText = generateReceiptText({
            invoiceNo: parseInt(transaction.id),
            transactionNo: transaction.id,
            timestamp: transaction.timestamp,
            cashierName: transaction.cashierName,
            items: transaction.items.map((item: any) => ({
                productName: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
                subtotal: item.product.price * item.quantity,
            })),
            subtotal: transaction.subtotal,
            tax: transaction.tax,
            total: transaction.total,
            paymentMethod: transaction.paymentMethod,
            change: transaction.change,
            itemsSold: transaction.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        });

        // Save receipt to downloads
        const blob = new Blob([receiptText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        clearCart();
        setPaymentOpen(false);
    };

    if (paymentOpen) {
        return (
            <AppLayout>
                <div className="flex flex-col h-full min-h-0 gap-4">
                    <div className="shrink-0">
                        <h1 className="text-2xl font-bold">Payment</h1>
                    </div>
                    <div className="flex-1 min-h-0 overflow-auto">
                        <PaymentScreen
                            total={total + tax}
                            items={cart}
                            onPaymentComplete={handlePaymentComplete}
                            onCancel={() => setPaymentOpen(false)}
                        />
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="flex flex-col h-full gap-6">
                <div>
                    <h1 className="text-2xl font-bold">New Transaction</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
                    {/* Products Section */}
                    <div className="lg:col-span-3 overflow-y-auto">
                        <ProductGrid/>
                    </div>

                    {/* Order Section */}
                    <div className="lg:col-span-2 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-lg font-semibold">Cart</h1>
                            <TxnModeSelector selectedMode={txnMode} onModeChange={setTxnMode} />
                        </div>
                        
                                {/* Cart — scrollable */}
                                <div className="flex-1 min-h-0 overflow-y-auto">
                                    <CartPanel/>
                                </div>

                                {/* Total — fixed at bottom */}
                                <div className="border-t pt-4 space-y-2 shrink-0">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">SubTotal:</span>
                                        <span className="font-bold">₱{total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tax (7.5%):</span>
                                        <span>₱{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Total:</span>
                                        <span className="text-blue-600">₱{(total + tax).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Buttons — always pinned at bottom */}
                                <div className="flex flex-col gap-2 pt-4 shrink-0">
                                    <Button onClick={() => setPaymentOpen(true)}
                                            disabled={cart.length === 0}
                                            size="lg"
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        <span>Checkout</span>
                                    </Button>

                                    {cart.length > 0 && (
                                        <Button onClick={() => {
                                                    if (confirm('Clear cart? This cannot be undone.')) {
                                                        clearCart();
                                                    }
                                                }}
                                                variant="outline"
                                                className="w-full"
                                        >
                                            Clear Cart
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                </AppLayout>
            );
        }