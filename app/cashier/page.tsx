        'use client';

import { AppLayout } from "@/components/layout/app-layout";
import { CartPanel } from "@/components/pos/cart";
import { ProductGrid} from "@/components/pos/product-grid";
import { Button } from "@/components/ui/button";
import { usePOS} from "@/lib/context";
import { PaymentMethod, TxnMode } from "@/lib/types";
import { PaymentScreen } from "@/components/pos/payment-screen";
import { TxnModeSelector } from "@/components/pos/txn-mode-selector";
import { DiscountModal } from "@/components/pos/discount-qty-modal";
import { generateReceiptText } from "@/lib/receipt";
import { useState } from "react";

export default function CashierPage() {

    const { currentUser, cart, getCartTotal, clearCart, createTransaction, discountCodes, calculateDiscount, calculateItemVATBreakdown } = usePOS();
    const [ paymentOpen, setPaymentOpen ]  = useState(false)
    const [ txnMode, setTxnMode ] = useState<TxnMode>('dine-in')
    const [ selectedDiscount, setSelectedDiscount ] = useState<number | null>(null)
    const [ cartOpen, setCartOpen ] = useState(true)
    const [ discountOpen, setDiscountOpen ] = useState(false)
    const [ selectedItemId, setSelectedItemId ] = useState<string | null>(null)
    const subtotal = getCartTotal();
    const discountAmount = calculateDiscount(cart);
    const total = subtotal - discountAmount;

    const handlePaymentComplete = async (method: PaymentMethod, change: number) => {
        // Convert cart items to transaction items with VAT breakdown
        const transactionItems = cart.map(item => calculateItemVATBreakdown(item));

        // Calculate VAT summary
        const vatableSales = transactionItems.reduce((sum, item) => sum + item.vatableAmt, 0);
        const vatExemptSales = transactionItems.reduce((sum, item) => sum + item.vatExemptAmt, 0);
        const vatAmount12Pct = transactionItems.reduce((sum, item) => sum + item.vatAmount12Pct, 0);
        const seniorDiscountAmount = transactionItems.reduce((sum, item) => {
            return sum + (item.discountDescription === 'Senior Citizen' ? item.discountAmount : 0);
        }, 0);
        const pwdDiscountAmount = transactionItems.reduce((sum, item) => {
            return sum + (item.discountDescription === 'PWD' ? item.discountAmount : 0);
        }, 0);
        const athleteDiscountAmount = transactionItems.reduce((sum, item) => {
            return sum + (item.discountDescription === 'Athlete' ? item.discountAmount : 0);
        }, 0);
        const regularDiscountAmount = transactionItems.reduce((sum, item) => {
            return sum + (item.discountDescription !== 'Senior Citizen' && item.discountDescription !== 'PWD' && item.discountDescription !== 'Athlete' ? item.discountAmount : 0);
        }, 0);
        const grossSales = subtotal + vatAmount12Pct;
        const netSales = grossSales - seniorDiscountAmount - pwdDiscountAmount - athleteDiscountAmount - regularDiscountAmount - vatAmount12Pct;

        const transaction = await createTransaction({
            cashierUserCode: currentUser!.id,
            cashierName: currentUser!.name,
            timestamp: new Date(),
            items: transactionItems,
            subtotal: subtotal,
            tax: vatAmount12Pct,
            total: total,
            paymentMethod: method,
            change: method === 'cash' ? change : undefined,
            txnMode: txnMode,
            discountCodeId: selectedDiscount || undefined,
            vatableSales,
            vatExemptSales,
            zeroRatedSales: 0,
            vatAmount12Pct,
            seniorDiscountAmount,
            pwdDiscountAmount,
            athleteDiscountAmount,
            regularDiscountAmount,
            grossSales,
            netSales,
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
                discountDescription: item.discountDescription,
                discountAmount: item.discountAmount,
            })),
            subtotal: transaction.subtotal,
            tax: transaction.tax,
            total: transaction.total,
            paymentMethod: transaction.paymentMethod,
            change: transaction.change,
            itemsSold: transaction.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
            vatableSales: transaction.vatableSales,
            vatExemptSales: transaction.vatExemptSales,
            vatAmount12Pct: transaction.vatAmount12Pct,
            seniorDiscountAmount: transaction.seniorDiscountAmount,
            pwdDiscountAmount: transaction.pwdDiscountAmount,
            athleteDiscountAmount: transaction.athleteDiscountAmount,
            regularDiscountAmount: transaction.regularDiscountAmount,
            grossSales: transaction.grossSales,
            netSales: transaction.netSales,
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
                            total={total}
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
            <div className="flex flex-col h-full gap-4">
                {/* Cart toggle button for small screens */}
                <div className="lg:hidden">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setCartOpen(!cartOpen)}
                        className="h-12 px-4"
                    >
                        Cart ({cart.length})
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 min-h-0 relative">
                    {/* Products Section */}
                    <div className="lg:col-span-3 overflow-y-auto min-h-0">
                        <ProductGrid/>
                    </div>

                    {/* Order Section - Side panel on desktop, drawer on mobile */}
                    <div className={`lg:col-span-2 flex flex-col min-h-0 min-w-[320px] fixed inset-y-0 right-0 z-50 bg-white lg:relative lg:bg-transparent lg:z-auto transition-transform duration-300 ease-in-out ${cartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} shadow-2xl lg:shadow-none`}>
                        <div className="flex items-center justify-between mb-3 p-4 lg:p-0">
                            <h1 className="text-lg font-bold">Cart</h1>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="default"
                                    onClick={() => setDiscountOpen(true)}
                                    disabled={!selectedItemId}
                                    className="h-9 text-xs active:scale-95 transition-transform"
                                >
                                    Discount
                                </Button>
                                <TxnModeSelector selectedMode={txnMode} onModeChange={setTxnMode} />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCartOpen(false)}
                                    className="lg:hidden"
                                >
                                    ✕
                                </Button>
                            </div>
                        </div>

                                {/* Cart — scrollable */}
                                <div className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-0">
                                    <CartPanel selectedItemId={selectedItemId} onSelectItem={setSelectedItemId}/>
                                </div>

                                {/* Total — fixed at bottom */}
                                <div className="pt-4 space-y-2 shrink-0 px-4 lg:px-0">
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground font-medium">Subtotal:</span>
                                            <span>₱{subtotal.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground font-medium">Discount:</span>
                                            <span className="text-green-600 font-semibold">-₱{discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Total:</span>
                                        <span className="text-blue-600">₱{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Buttons — always pinned at bottom */}
                                <div className="flex gap-2 pt-4 shrink-0 px-4 pb-4 lg:px-0 lg:pb-0">
                                    <Button onClick={() => setPaymentOpen(true)}
                                            disabled={cart.length === 0}
                                            size="lg"
                                            className="flex-1 h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform"
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
                                                size="default"
                                                className="flex-1 h-12 text-sm font-medium active:scale-95 transition-transform"
                                        >
                                            Clear Cart
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                    {/* Overlay for mobile drawer */}
                    {cartOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setCartOpen(false)}
                        />
                    )}
                </div>

                {/* Discount Modal */}
                <DiscountModal
                    open={discountOpen}
                    onOpenChange={setDiscountOpen}
                    selectedItemId={selectedItemId}
                    discountCodes={discountCodes}
                />


                </AppLayout>
            );
        }