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
import { CardPaymentModal, CardPaymentData } from "@/components/pos/card-payment-modal";
import { TransactionSuccessModal } from "@/components/pos/transaction-success-modal";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { generateReceiptText } from "@/lib/receipt";
import { calculateSalesBreakdown } from "@/lib/bir-computation";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Percent } from "lucide-react";

export default function CashierPage() {

    const { currentUser, cart, getCartTotal, clearCart, createTransaction, discountCodes, calculateDiscount, calculateItemVATBreakdown } = usePOS();
    const [ paymentOpen, setPaymentOpen ]  = useState(false)
    const [ cardPaymentOpen, setCardPaymentOpen ]  = useState(false)
    const [ cardPaymentData, setCardPaymentData ]  = useState<CardPaymentData | null>(null)
    const [ txnMode, setTxnMode ] = useState<TxnMode>('dine-in')
    const [ selectedDiscount, setSelectedDiscount ] = useState<number | null>(null)
    const [ cartOpen, setCartOpen ] = useState(true)
    const [ discountOpen, setDiscountOpen ] = useState(false)
    const [ selectedItemId, setSelectedItemId ] = useState<string | null>(null)
    const [ clearCartOpen, setClearCartOpen ] = useState(false)
    const [ isProcessing, setIsProcessing ] = useState(false)
    const [ successModalOpen, setSuccessModalOpen ] = useState(false)
    const [ lastTransaction, setLastTransaction ] = useState<{ id: string; total: number; paymentMethod: string } | null>(null)
    const subtotal = getCartTotal();
    const discountAmount = calculateDiscount(cart);
    const total = subtotal - discountAmount;

    const handlePaymentComplete = async (method: PaymentMethod, change: number) => {
        // If card payment, show card payment modal first
        if (method === 'card') {
            setCardPaymentOpen(true);
            return;
        }

        await processTransaction(method, change, null);
    };

    const handleCardPaymentComplete = async (cardData: CardPaymentData) => {
        setCardPaymentData(cardData);
        await processTransaction('card', 0, cardData);
    };

    const processTransaction = async (method: PaymentMethod, change: number, cardData: CardPaymentData | null) => {
        setIsProcessing(true);
        
        // Convert cart items to transaction items with VAT breakdown
        const transactionItems = cart.map(item => calculateItemVATBreakdown(item));

        // Calculate VAT summary
        // Vatable Sales should be net of VAT (divide by 1.12)
        const vatableSales = transactionItems.reduce((sum, item) => sum + item.vatableAmt, 0) / 1.12;
        const vatExemptSales = transactionItems.reduce((sum, item) => sum + item.vatExemptAmt, 0);
        const vatAmount12Pct = vatableSales * 0.12;
        const lessVat = transactionItems.reduce((sum, item) => sum + item.lessVat, 0);
        const seniorDiscountAmount = transactionItems.reduce((sum, item) => {
            return sum + (item.discountDescription === 'Senior Citizen' ? (item.discountAmount || 0) : 0);
        }, 0);
        const pwdDiscountAmount = transactionItems.reduce((sum, item) => {
            return sum + (item.discountDescription === 'PWD' ? (item.discountAmount || 0) : 0);
        }, 0);
        const athleteDiscountAmount = transactionItems.reduce((sum, item) => {
            return sum + (item.discountDescription === 'Athlete' ? (item.discountAmount || 0) : 0);
        }, 0);
        const regularDiscountAmount = transactionItems.reduce((sum, item) => {
            return sum + (item.discountDescription !== 'Senior Citizen' && item.discountDescription !== 'PWD' && item.discountDescription !== 'Athlete' ? (item.discountAmount || 0) : 0);
        }, 0);

        // BIR-compliant calculations
        // Gross Sales = Subtotal (before any deductions)
        const grossSales = subtotal;
        // Net Sales = Gross Sales - Senior Discount - PWD Discount - Athlete Discount - Regular Discount - Less VAT
        const netSales = grossSales - seniorDiscountAmount - pwdDiscountAmount - athleteDiscountAmount - regularDiscountAmount - lessVat;
        // Total Due = Net Sales (VAT is already included in item prices, so customer pays full amount)
        const totalDue = netSales;

        // Extract beneficiary info from cart items (for SC/PWD/Athlete discounts)
        const beneficiaryInfoItem = cart.find(item => item.beneficiaryId && item.beneficiaryName);
        const beneficiaryId = beneficiaryInfoItem?.beneficiaryId;
        const beneficiaryName = beneficiaryInfoItem?.beneficiaryName;

        const transaction = await createTransaction({
            cashierUserCode: currentUser!.id,
            cashierName: currentUser!.name,
            timestamp: new Date(),
            items: transactionItems,
            subtotal: subtotal,
            tax: vatAmount12Pct,
            total: totalDue,
            paymentMethod: method,
            change: method === 'cash' ? change : undefined,
            txnMode: txnMode,
            discountCode: selectedDiscount || undefined,
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
            lessVat,
            cardPaymentData: cardData || undefined,
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
            lessVat: transaction.lessVat,
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
        setIsProcessing(false);
        setLastTransaction({
            id: transaction.id,
            total: transaction.total,
            paymentMethod: transaction.paymentMethod
        });
        setSuccessModalOpen(true);
    };

    return (
        <AppLayout>
            {paymentOpen ? (
                <div className="flex flex-col h-full min-h-0 gap-4 relative">
                    {isProcessing && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="flex flex-col items-center gap-3">
                                <Spinner size={48} />
                                <p className="text-lg font-medium">Processing transaction...</p>
                            </div>
                        </div>
                    )}
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
            ) : (
                <>
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
                                        className="h-9 text-xs active:scale-95 transition-transform border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800"
                                    >
                                        <Percent className="h-3 w-3 mr-1" />
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
                                            <Button onClick={() => setClearCartOpen(true)}
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
                    </div>

                {/* Overlay for mobile drawer */}
                {cartOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setCartOpen(false)}
                    />
                )}
                </>
            )}

            {/* Discount Modal */}
            <DiscountModal
                open={discountOpen}
                onOpenChange={setDiscountOpen}
                selectedItemId={selectedItemId}
                discountCodes={discountCodes}
            />

            {/* Card Payment Modal */}
            <CardPaymentModal
                open={cardPaymentOpen}
                onOpenChange={setCardPaymentOpen}
                amount={total}
                onPaymentComplete={handleCardPaymentComplete}
            />

            {/* Transaction Success Modal */}
            {lastTransaction && (
                <TransactionSuccessModal
                    open={successModalOpen}
                    onOpenChange={setSuccessModalOpen}
                    transactionId={lastTransaction.id}
                    total={lastTransaction.total}
                    paymentMethod={lastTransaction.paymentMethod}
                />
            )}

            {/* Clear Cart Confirmation Dialog */}
            <Dialog open={clearCartOpen} onOpenChange={setClearCartOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear Cart</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to clear the cart? This action cannot be undone and will remove all {cart.length} item(s).
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setClearCartOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                clearCart();
                                setClearCartOpen(false);
                                setSelectedItemId(null);
                            }}
                        >
                            Clear Cart
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
