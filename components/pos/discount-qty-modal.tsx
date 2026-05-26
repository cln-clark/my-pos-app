'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePOS } from "@/lib/context";

interface DiscountModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedItemId: string | null;
    discountCodes: Array<{ id: number; name: string; percent: number }>;
}

export function DiscountModal({ open, onOpenChange, selectedItemId, discountCodes }: DiscountModalProps) {
    const { cart, setItemDiscountCode } = usePOS();

    const selectedItem = cart.find(item => item.product.id === selectedItemId);
    const currentDiscountId = selectedItem?.discountCodeId;

    const handleSelectDiscount = (discountId: number | null) => {
        if (selectedItemId) {
            setItemDiscountCode(selectedItemId, discountId || undefined);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Select Discount</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-6">
                    {!selectedItem ? (
                        <p className="text-base text-muted-foreground text-center py-8">
                            Please select an item first
                        </p>
                    ) : (
                        <>
                            <div className="p-3 bg-slate-50 rounded-lg border mb-4">
                                <p className="font-semibold text-base">{selectedItem.product.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {selectedItem.quantity}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={currentDiscountId === null ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => handleSelectDiscount(null)}
                                    className="flex-1 h-14 text-lg font-semibold active:scale-95 transition-transform"
                                >
                                    No Discount
                                </Button>
                                {discountCodes.map((discount) => (
                                    <Button
                                        key={discount.id}
                                        variant={currentDiscountId === discount.id ? "default" : "outline"}
                                        size="lg"
                                        onClick={() => handleSelectDiscount(discount.id)}
                                        className="flex-1 h-14 text-lg font-semibold active:scale-95 transition-transform"
                                    >
                                        {discount.name} ({discount.percent}%)
                                    </Button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="h-12 px-8 text-base font-semibold active:scale-95 transition-transform"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
